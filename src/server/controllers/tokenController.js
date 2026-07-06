import { config } from '../config/env.js';

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
