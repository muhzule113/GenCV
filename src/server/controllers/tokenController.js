import postgres from 'postgres';
import { config } from '../config/env.js';

const sql = postgres(config.database.url);

/** GET /api/tokens/balance */
export async function getBalance(req, res) {
  try {
    const [row] = await sql`
      SELECT balance, total_used FROM user_tokens WHERE user_id = ${req.user.id} LIMIT 1
    `;
    res.json({
      success: true,
      data: {
        balance: row?.balance ?? 0,
        totalUsed: row?.total_used ?? 0,
      },
    });
  } catch (err) {
    console.error('getBalance error:', err);
    res.status(500).json({ error: 'Gagal membaca saldo token' });
  }
}

/** GET /api/tokens/packages */
export async function listPackages(req, res) {
  try {
    const rows = await sql`
      SELECT id, name, tokens, price FROM token_packages WHERE is_active = true
    `;
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listPackages error:', err);
    res.status(500).json({ error: 'Gagal memuat paket token' });
  }
}

/** POST /api/tokens/purchase (create purchase + Midtrans Snap transaction) */
export async function createPurchase(req, res) {
  const { package_id } = req.body;
  if (!package_id) return res.status(400).json({ error: 'package_id wajib diisi' });

  try {
    const [pkg] = await sql`
      SELECT tokens, price FROM token_packages WHERE id = ${package_id} LIMIT 1
    `;
    if (!pkg) return res.status(404).json({ error: 'Paket token tidak ditemukan' });

    const short = req.user.id.replace(/-/g, '').slice(0, 8);
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 6);
    const orderId = `GENCV-${short}-${ts}-${rand}`;

    // Create pending purchase record
    const [purchase] = await sql`
      INSERT INTO token_purchases (user_id, package_id, tokens, amount, status, order_id)
      VALUES (${req.user.id}, ${package_id}, ${pkg.tokens}, ${pkg.price}, 'pending', ${orderId})
      RETURNING *
    `;

    // Expire existing pending transactions
    await sql`
      UPDATE payment_transactions SET status = 'expired'
      WHERE user_id = ${req.user.id} AND status = 'pending'
    `;

    // Create Midtrans Snap transaction
    const auth = Buffer.from(config.midtrans.serverKey + ':').toString('base64');
    const snapBody = {
      transaction_details: { order_id: orderId, gross_amount: pkg.price },
      item_details: [{ id: orderId, price: pkg.price, quantity: 1, name: `${pkg.tokens} Token`, category: 'Token' }],
      credit_card: { secure: true },
    };

    let snapToken = null;
    try {
      const snapResp = await fetch(config.midtrans.snapUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}`, Accept: 'application/json' },
        body: JSON.stringify(snapBody),
      });
      if (snapResp.ok) {
        const snapData = await snapResp.json();
        snapToken = snapData.token;
      } else {
        console.error('Midtrans Snap error:', snapResp.status, await snapResp.text());
      }
    } catch (snapErr) {
      console.error('Midtrans Snap network error:', snapErr);
    }

    // Create payment_transactions record
    await sql`
      INSERT INTO payment_transactions (user_id, order_id, package_id, tokens, amount, status, snap_token)
      VALUES (${req.user.id}, ${orderId}, ${package_id}, ${pkg.tokens}, ${pkg.price}, 'pending', ${snapToken})
    `;

    res.status(201).json({
      success: true,
      data: { ...purchase, snap_token: snapToken, order_id: orderId },
      message: snapToken
        ? 'Pesanan dibuat. Snap token ready.'
        : 'Pesanan dibuat (tanpa Midtrans). Lanjutkan via konfirmasi manual.',
    });
  } catch (err) {
    console.error('createPurchase error:', err);
    res.status(500).json({ error: 'Gagal membuat pesanan' });
  }
}

/** POST /api/tokens/confirm */
export async function confirmPurchase(req, res) {
  const { purchase_id } = req.body;
  if (!purchase_id) return res.status(400).json({ error: 'purchase_id wajib diisi' });

  try {
    const [updated] = await sql`
      UPDATE token_purchases SET status = 'completed', paid_at = NOW()
      WHERE id = ${purchase_id} AND user_id = ${req.user.id} AND status = 'pending'
      RETURNING tokens
    `;
    if (!updated) return res.status(404).json({ error: 'Pesanan tidak ditemukan atau sudah diproses' });

    // Add tokens via RPC
    await sql`SELECT * FROM add_tokens(${req.user.id}, ${updated.tokens})`;

    res.json({ success: true, message: 'Token berhasil ditambahkan' });
  } catch (err) {
    console.error('confirmPurchase error:', err);
    res.status(500).json({ error: 'Gagal mengkonfirmasi pembayaran' });
  }
}

/** GET /api/tokens/purchase/:orderId/status */
export async function getPurchaseStatus(req, res) {
  const { orderId } = req.params;
  if (!orderId) return res.status(400).json({ error: 'order_id wajib diisi' });

  try {
    const [tx] = await sql`
      SELECT status, tokens, midtrans_transaction_id, payment_method, settled_at, created_at
      FROM payment_transactions WHERE order_id = ${orderId} AND user_id = ${req.user.id} LIMIT 1
    `;
    if (!tx) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

    if (tx.status === 'settlement') {
      return res.json({ success: true, data: { status: 'settlement', tokens: tx.tokens, paymentMethod: tx.payment_method, settledAt: tx.settled_at, createdAt: tx.created_at } });
    }

    // Cek Midtrans Core API
    const coreAuth = 'Basic ' + Buffer.from(config.midtrans.serverKey + ':').toString('base64');
    let mtStatus = null;
    try {
      const coreResp = await fetch(`${config.midtrans.coreApiUrl}/${orderId}/status`, {
        method: 'GET',
        headers: { Authorization: coreAuth, Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (coreResp.ok) {
        const json = await coreResp.json();
        if (json.status_code !== '404' && json.transaction_status) {
          mtStatus = json;
        }
      }
    } catch { /* timeout ok */ }

    if (mtStatus) {
      const ts = mtStatus.transaction_status;
      if (ts === 'settlement' || ts === 'capture') {
        try {
          await sql`SELECT * FROM credit_tokens(${orderId}, ${mtStatus.transaction_id || ''}, ${mtStatus.payment_type || ''}, ${sql.json(mtStatus)})`;
          return res.json({ success: true, data: { status: 'settlement', tokens: tx.tokens, paymentMethod: mtStatus.payment_type, settledAt: new Date().toISOString(), createdAt: tx.created_at } });
        } catch (creditErr) {
          console.error('credit_tokens RPC error:', creditErr);
        }
      }

      if (['deny', 'cancel', 'expire', 'failure'].includes(ts)) {
        const newStatus = ts === 'expire' ? 'expired' : 'denied';
        await sql`UPDATE payment_transactions SET status = ${newStatus} WHERE order_id = ${orderId}`.catch(() => {});
      }
    }

    return res.json({ success: true, data: { status: tx.status, tokens: tx.tokens, paymentMethod: tx.payment_method, createdAt: tx.created_at } });
  } catch (err) {
    console.error('getPurchaseStatus error:', err);
    res.status(503).json({ error: 'Cek status pembayaran sedang lambat, coba lagi' });
  }
}

/** Build Midtrans Core API charge payload per payment method */
function methodConfig(paymentMethod) {
  const map = {
    bca_va:     { paymentType: 'bank_transfer', bank: 'bca' },
    bni_va:     { paymentType: 'bank_transfer', bank: 'bni' },
    bri_va:     { paymentType: 'bank_transfer', bank: 'bri' },
    permata_va: { paymentType: 'bank_transfer', bank: 'permata' },
    mandiri_va: { paymentType: 'echannel',       bank: null },
    gopay:      { paymentType: 'gopay',          bank: null },
  };
  return map[paymentMethod];
}

function paymentCategory(method) {
  const cfg = methodConfig(method);
  if (!cfg) return null;
  return cfg.paymentType === 'echannel' ? 'echannel' : cfg.paymentType === 'gopay' ? 'gopay' : 'bank_transfer';
}

function buildChargePayload(orderId, grossAmount, paymentMethod) {
  const cfg = methodConfig(paymentMethod);
  if (!cfg) throw new Error(`Metode pembayaran ${paymentMethod} tidak didukung`);

  const base = {
    transaction_details: { order_id: orderId, gross_amount: grossAmount },
    item_details: [{ id: orderId, price: grossAmount, quantity: 1, name: `${grossAmount < 20000 ? 'Starter' : grossAmount < 50000 ? 'Popular' : 'Pro'} Token AI`, category: 'Token' }],
    customer_details: {},
    payment_type: cfg.paymentType,
  };

  if (cfg.paymentType === 'bank_transfer') base.bank_transfer = { bank: cfg.bank };
  else if (cfg.paymentType === 'echannel') base.echannel = { bill_info1: 'Pembayaran Token AI', bill_info2: 'GenCV' };

  return base;
}

function parseChargeResponse(method, midtransResp) {
  const txId = midtransResp.transaction_id;
  const status = midtransResp.transaction_status;
  const cfg = methodConfig(method);
  const cat = paymentCategory(method);
  const instructions = { txId, status, type: cat, bank: cfg?.bank || null };

  if (cat === 'bank_transfer') {
    if (midtransResp.va_numbers?.length) {
      instructions.vaNumber = midtransResp.va_numbers[0].va_number;
      instructions.bank = midtransResp.va_numbers[0].bank;
    }
    if (midtransResp.permata_va_number) {
      instructions.vaNumber = midtransResp.permata_va_number;
      instructions.bank = 'permata';
    }
  }

  if (cat === 'echannel') {
    if (midtransResp.bill_key) {
      instructions.vaNumber = midtransResp.bill_key;
      instructions.billCode = midtransResp.biller_code;
    }
  }

  if (cat === 'gopay') {
    const qrAction = (midtransResp.actions || []).find(a => a.name === 'generate-qr-code');
    instructions.qrUrl = qrAction?.url || null;
    instructions.deepLink = (midtransResp.actions || []).find(a => a.name === 'deeplink-redirect')?.url || null;
  }

  return instructions;
}

/** Static package map — no DB call needed */
const PACKAGES = {
  starter: { tokens: 10, price: 15000 },
  popular: { tokens: 25, price: 30000 },
  pro:     { tokens: 60, price: 60000 },
};

/** POST /api/tokens/charge — create purchase + charge via Midtrans Core API */
export async function createCharge(req, res) {
  const { package_id, payment_method } = req.body;
  if (!package_id) return res.status(400).json({ error: 'package_id wajib diisi' });
  if (!payment_method) return res.status(400).json({ error: 'payment_method wajib diisi' });

  const supported = ['bca_va', 'bni_va', 'bri_va', 'mandiri_va', 'permata_va', 'gopay'];
  if (!supported.includes(payment_method)) {
    return res.status(400).json({ error: `Metode ${payment_method} tidak didukung` });
  }

  const pkg = PACKAGES[package_id];
  if (!pkg) return res.status(404).json({ error: 'Paket token tidak ditemukan' });

  try {
    const short = req.user.id.replace(/-/g, '').slice(0, 8);
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 6);
    const orderId = `GENCV-${short}-${ts}-${rand}`;

    // Expire existing pending transactions
    await sql`
      UPDATE payment_transactions SET status = 'expired'
      WHERE user_id = ${req.user.id} AND status = 'pending'
    `;

    // Call Midtrans Core API
    const coreAuth = 'Basic ' + Buffer.from(config.midtrans.serverKey + ':').toString('base64');
    const chargePayload = buildChargePayload(orderId, pkg.price, payment_method);
    const coreResp = await fetch(`${config.midtrans.coreApiUrl}/charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: coreAuth, Accept: 'application/json' },
      body: JSON.stringify(chargePayload),
    });

    const coreData = await coreResp.json();
    if (!coreResp.ok) {
      console.error('Midtrans Core API error:', coreResp.status, JSON.stringify(coreData));
      return res.status(502).json({ error: 'Gagal membuat pembayaran', detail: coreData.status_message || 'Midtrans error' });
    }

    // Save payment_transactions (fire-and-forget)
    sql`
      INSERT INTO payment_transactions (user_id, order_id, package_id, tokens, amount, status, midtrans_transaction_id, payment_method, raw_response)
      VALUES (${req.user.id}, ${orderId}, ${package_id}, ${pkg.tokens}, ${pkg.price}, 'pending', ${coreData.transaction_id || ''}, ${payment_method}, ${sql.json(coreData)})
    `.catch(err => console.error('Failed to save payment_transactions:', err));

    const instructions = parseChargeResponse(payment_method, coreData);

    res.status(201).json({
      success: true,
      data: { order_id: orderId, payment_method, amount: pkg.price, tokens: pkg.tokens, ...instructions },
    });
  } catch (err) {
    console.error('createCharge error:', err);
    res.status(500).json({ error: 'Gagal membuat pembayaran' });
  }
}

/** PATCH /api/tokens/purchase/:orderId/expire */
export async function expirePurchase(req, res) {
  const { orderId } = req.params;
  if (!orderId) return res.status(400).json({ error: 'order_id wajib diisi' });
  try {
    await sql`UPDATE payment_transactions SET status = 'expired' WHERE order_id = ${orderId}`;
    return res.json({ success: true });
  } catch (err) {
    console.error('expirePurchase error:', err);
    res.status(500).json({ error: 'Gagal memperbarui status' });
  }
}
