import { config } from '../config/env.js';
import { fetchWithTimeout } from '../config/http.js';

const serviceHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${config.insforge.serviceKey}`,
};

function dbUrl(table) {
  return `${config.insforge.url}/api/database/records/${table}`;
}

function rpcUrl(fn) {
  return `${config.insforge.url}/api/database/rpc/${fn}`;
}

/** GET /api/tokens/balance */
export async function getBalance(req, res) {
  try {
    const resp = await fetch(
      `${dbUrl('user_tokens')}?user_id=eq.${req.user.id}&select=balance,total_used`,
      { headers: serviceHeaders },
    );
    if (!resp.ok) {
      return res.status(500).json({ error: 'Gagal membaca saldo token' });
    }
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : null;
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

export async function listPackages(req, res) {
  try {
    const resp = await fetch(
      `${dbUrl('token_packages')}?is_active=eq.true&select=id,name,tokens,price`,
      { headers: serviceHeaders },
    );
    if (!resp.ok) {
      return res.status(500).json({ error: 'Gagal memuat paket token' });
    }
    const data = await resp.json();
    res.json({ success: true, data: Array.isArray(data) ? data : [] });
  } catch (err) {
    console.error('listPackages error:', err);
    res.status(500).json({ error: 'Gagal memuat paket token' });
  }
}

/** POST /api/tokens/purchase  (create purchase + Midtrans Snap transaction) */
export async function createPurchase(req, res) {
  const { package_id } = req.body;
  if (!package_id) {
    return res.status(400).json({ error: 'package_id wajib diisi' });
  }

  try {
    // Fetch package info
    const pkgResp = await fetch(
      `${dbUrl('token_packages')}?id=eq.${package_id}&select=tokens,price`,
      { headers: serviceHeaders },
    );
    if (!pkgResp.ok) {
      return res.status(500).json({ error: 'Gagal memuat detail paket' });
    }
    const pkgData = await pkgResp.json();
    const pkg = Array.isArray(pkgData) ? pkgData[0] : null;
    if (!pkg) {
      return res.status(404).json({ error: 'Paket token tidak ditemukan' });
    }

    // Generate unique order_id
    const short = req.user.id.replace(/-/g, '').slice(0, 8);
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 6);
    const orderId = `GENCV-${short}-${ts}-${rand}`;

    // Create pending purchase record
    const purchaseResp = await fetch(
      dbUrl('token_purchases'),
      {
        method: 'POST',
        headers: {
          ...serviceHeaders,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          user_id: req.user.id,
          package_id,
          tokens: pkg.tokens,
          amount: pkg.price,
          status: 'pending',
          order_id: orderId,
        }),
      },
    );
    if (!purchaseResp.ok) {
      return res.status(500).json({ error: 'Gagal membuat pesanan' });
    }
    const purchaseRaw = await purchaseResp.json();
    const purchase = Array.isArray(purchaseRaw) ? purchaseRaw[0] : purchaseRaw;

    // Create Midtrans Snap transaction
    const auth = Buffer.from(config.midtrans.serverKey + ':').toString('base64');
    const snapBody = {
      transaction_details: {
        order_id: orderId,
        gross_amount: pkg.price,
      },
      item_details: [
        {
          id: orderId,
          price: pkg.price,
          quantity: 1,
          name: `${pkg.tokens} Token`,
          category: 'Token',
        },
      ],
      credit_card: { secure: true },
    };

    const snapResp = await fetch(config.midtrans.snapUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(snapBody),
    });

    let snapToken = null;
    if (snapResp.ok) {
      const snapData = await snapResp.json();
      snapToken = snapData.token;
    } else {
      console.error('Midtrans Snap error:', snapResp.status, await snapResp.text());
      // Continue without snap_token if Midtrans fails (legacy confirm flow)
    }

    // Create payment_transactions record
    await fetch(
      dbUrl('payment_transactions'),
      {
        method: 'POST',
        headers: serviceHeaders,
        body: JSON.stringify({
          user_id: req.user.id,
          order_id: orderId,
          package_id,
          tokens: pkg.tokens,
          amount: pkg.price,
          status: 'pending',
          snap_token: snapToken,
        }),
      },
    );

    res.status(201).json({
      success: true,
      data: {
        ...purchase,
        snap_token: snapToken,
        order_id: orderId,
      },
      message: snapToken
        ? 'Pesanan dibuat. Snap token ready.'
        : 'Pesanan dibuat (tanpa Midtrans). Lanjutkan via konfirmasi manual.',
    });
  } catch (err) {
    console.error('createPurchase error:', err);
    res.status(500).json({ error: 'Gagal membuat pesanan' });
  }
}

export async function confirmPurchase(req, res) {
  const { purchase_id } = req.body;
  if (!purchase_id) {
    return res.status(400).json({ error: 'purchase_id wajib diisi' });
  }

  try {
    // Update purchase status
    const updateResp = await fetch(
      `${dbUrl('token_purchases')}?id=eq.${purchase_id}&user_id=eq.${req.user.id}&status=eq.pending`,
      {
        method: 'PATCH',
        headers: serviceHeaders,
        body: JSON.stringify({
          status: 'completed',
          paid_at: new Date().toISOString(),
        }),
      },
    );
    if (!updateResp.ok) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan atau sudah diproses' });
    }

    // Get purchase info for token amount
    const getResp = await fetch(
      `${dbUrl('token_purchases')}?id=eq.${purchase_id}&select=tokens`,
      { headers: serviceHeaders },
    );
    const getData = await getResp.json();
    const purchase = Array.isArray(getData) ? getData[0] : null;
    if (!purchase) {
      return res.status(404).json({ error: 'Data pesanan tidak ditemukan' });
    }

    // Add tokens to user balance via RPC
    await fetch(rpcUrl('add_tokens'), {
      method: 'POST',
      headers: {
        ...serviceHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_user_id: req.user.id,
        p_tokens: purchase.tokens,
      }),
    });

    res.json({ success: true, message: 'Token berhasil ditambahkan' });
  } catch (err) {
    console.error('confirmPurchase error:', err);
    res.status(500).json({ error: 'Gagal mengkonfirmasi pembayaran' });
  }
}

/** GET /api/tokens/purchase/:orderId/status */
/** GET /api/tokens/purchase/:orderId/status — with Midtrans Core API fallback */
export async function getPurchaseStatus(req, res) {
  const { orderId } = req.params;
  if (!orderId) return res.status(400).json({ error: 'order_id wajib diisi' });

  try {
    // 1. Cek DB dulu (fast path)
    const dbResp = await fetchWithTimeout(
      `${dbUrl('payment_transactions')}?order_id=eq.${orderId}&user_id=eq.${req.user.id}&select=status,tokens,midtrans_transaction_id,payment_method,settled_at,created_at`,
      { headers: serviceHeaders },
      8000,
    );
    if (!dbResp.ok) return res.status(500).json({ error: 'Gagal membaca status pembayaran' });
    const dbData = await dbResp.json();
    const tx = Array.isArray(dbData) ? dbData[0] : null;
    if (!tx) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

    // Kalo udah settlement langsung balikin
    if (tx.status === 'settlement') {
      return res.json({ success: true, data: { status: 'settlement', tokens: tx.tokens, paymentMethod: tx.payment_method, settledAt: tx.settled_at, createdAt: tx.created_at } });
    }

    // 2. Kalo masih pending, cek langsung ke Midtrans Core API (self-healing)
    const coreResp = await fetchWithTimeout(`${config.midtrans.coreApiUrl}/${orderId}/status`, {
      method: 'GET',
      headers: { Authorization: coreAuth(), Accept: 'application/json' },
    }, 8000);

    const mtStatus = coreResp.ok ? await coreResp.json() : null;
    const midtransOk = mtStatus && mtStatus.status_code !== '404' && mtStatus.transaction_status;

    if (midtransOk) {
      const ts = mtStatus.transaction_status;

      if (ts === 'settlement' || ts === 'capture') {
        // Kredit token lewat RPC (sama kaya webhook)
        const rpcResp = await fetchWithTimeout(rpcUrl('credit_tokens'), {
          method: 'POST',
          headers: { ...serviceHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            p_order_id: orderId,
            p_midtrans_tx_id: mtStatus.transaction_id,
            p_payment_method: mtStatus.payment_type,
            p_raw: JSON.stringify(mtStatus),
          }),
        }, 8000);

        if (rpcResp.ok) {
          return res.json({ success: true, data: { status: 'settlement', tokens: tx.tokens, paymentMethod: mtStatus.payment_type, settledAt: new Date().toISOString(), createdAt: tx.created_at } });
        }
      }

      // Update DB kalo failed/expired
      if (['deny', 'cancel', 'expire', 'failure'].includes(ts)) {
        fetch(`${dbUrl('payment_transactions')}?order_id=eq.${orderId}`, {
          method: 'PATCH',
          headers: serviceHeaders,
          body: JSON.stringify({ status: ts === 'expire' ? 'expired' : 'denied' }),
        }).catch(() => {});
      }
    }

    // Balikin status dari DB
    return res.json({ success: true, data: { status: tx.status, tokens: tx.tokens, paymentMethod: tx.payment_method, createdAt: tx.created_at } });
  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    console.error('getPurchaseStatus error:', isAbort ? 'timeout' : err);
    // Timeout/upstream unavailable — tell client to retry, don't hard-fail.
    res.status(503).json({ error: 'Cek status pembayaran sedang lambat, coba lagi' });
  }
}

/** Core API auth header */
function coreAuth() {
  return 'Basic ' + Buffer.from(config.midtrans.serverKey + ':').toString('base64');
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
  return cfg.paymentType === 'echannel' ? 'echannel'
    : cfg.paymentType === 'gopay' ? 'gopay'
    : 'bank_transfer';
}

function buildChargePayload(orderId, grossAmount, paymentMethod) {
  const cfg = methodConfig(paymentMethod);
  if (!cfg) throw new Error(`Metode pembayaran ${paymentMethod} tidak didukung`);

  const base = {
    transaction_details: { order_id: orderId, gross_amount: grossAmount },
    item_details: [
      { id: orderId, price: grossAmount, quantity: 1, name: `${grossAmount < 20000 ? 'Starter' : grossAmount < 50000 ? 'Popular' : 'Pro'} Token AI`, category: 'Token' },
    ],
    customer_details: {},
    payment_type: cfg.paymentType,
  };

  if (cfg.paymentType === 'bank_transfer') {
    base.bank_transfer = { bank: cfg.bank };
  } else if (cfg.paymentType === 'echannel') {
    base.echannel = { bill_info1: 'Pembayaran Token AI', bill_info2: 'GenCV' };
  }

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



/** POST /api/tokens/charge — create purchase + charge via Midtrans Core API */
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
    // Generate order_id (sync, fast)
    const short = req.user.id.replace(/-/g, '').slice(0, 8);
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 6);
    const orderId = `GENCV-${short}-${ts}-${rand}`;

    // Call Midtrans Core API
    const chargePayload = buildChargePayload(orderId, pkg.price, payment_method);
    const coreResp = await fetch(`${config.midtrans.coreApiUrl}/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: coreAuth(),
        Accept: 'application/json',
      },
      body: JSON.stringify(chargePayload),
    });

    const coreData = await coreResp.json();
    if (!coreResp.ok) {
      console.error('Midtrans Core API error:', coreResp.status, JSON.stringify(coreData));
      return res.status(502).json({
        error: 'Gagal membuat pembayaran',
        detail: coreData.status_message || 'Midtrans error',
      });
    }

    // Save payment_transactions (fire-and-forget — don't block response)
    fetch(dbUrl('payment_transactions'), {
      method: 'POST',
      headers: { ...serviceHeaders, Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id: req.user.id,
        order_id: orderId,
        package_id,
        tokens: pkg.tokens,
        amount: pkg.price,
        status: 'pending',
        midtrans_transaction_id: coreData.transaction_id,
        payment_method,
        raw_response: coreData,
      }),
    }).catch(err => console.error('Failed to save payment_transactions:', err));

    const instructions = parseChargeResponse(payment_method, coreData);

    res.status(201).json({
      success: true,
      data: {
        order_id: orderId,
        payment_method,
        amount: pkg.price,
        tokens: pkg.tokens,
        ...instructions,
      },
    });
  } catch (err) {
    console.error('createCharge error:', err);
    res.status(500).json({ error: 'Gagal membuat pembayaran' });
  }
}
