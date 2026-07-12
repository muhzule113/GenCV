import crypto from 'node:crypto';
import postgres from 'postgres';
import { config } from '../config/env.js';

const sql = postgres(config.database.url);

const MIDTRANS_IPS = [
  '103.26.52.0/24',
  '103.26.53.0/24',
  '103.26.54.0/24',
  '103.26.55.0/24',
  '167.172.0.0/16',
  '142.93.0.0/16',
  '128.199.0.0/16',
];

function isMidtransIp(ip) {
  const ipNum = ip.split('.').reduce((a, b) => (a << 8) + parseInt(b), 0) >>> 0;
  return MIDTRANS_IPS.some(cidr => {
    const [range, bits] = cidr.split('/');
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);
    const rangeNum = range.split('.').reduce((a, b) => (a << 8) + parseInt(b), 0) >>> 0;
    return (ipNum & mask) === (rangeNum & mask);
  });
}

function generateOrderId(userId) {
  const short = userId.replace(/-/g, '').slice(0, 8);
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `GENCV-${short}-${ts}-${rand}`;
}

async function createSnapTransaction(orderId, grossAmount, itemName) {
  const auth = Buffer.from(config.midtrans.serverKey + ':').toString('base64');
  const body = {
    transaction_details: { order_id: orderId, gross_amount: grossAmount },
    item_details: [{ id: orderId, price: grossAmount, quantity: 1, name: itemName, category: 'Token' }],
    credit_card: { secure: true },
    customer_details: {},
  };

  const resp = await fetch(config.midtrans.snapUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}`, Accept: 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Midtrans Snap error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  return data.token;
}

export function verifySignature(orderId, statusCode, grossAmount, serverKey, signatureKey) {
  const hash = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest('hex');
  return hash === signatureKey;
}

/** POST /api/midtrans/webhook */
export async function handleWebhook(req, res) {
  try {
    const notification = req.body;
    const callerIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    if (!isMidtransIp(callerIp)) {
      console.error('Midtrans webhook from non-Midtrans IP:', callerIp);
      return res.status(403).json({ error: 'Forbidden' });
    }

    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const transactionId = notification.transaction_id;
    const paymentType = notification.payment_type;

    if (!verifySignature(orderId, statusCode, grossAmount, config.midtrans.serverKey, signatureKey)) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const isSuccess =
      transactionStatus === 'settlement' ||
      transactionStatus === 'capture' ||
      (transactionStatus === 'accept' && fraudStatus === 'accept');

    if (isSuccess) {
      // Idempotent: credit_tokens RPC via postgres.js
      try {
        await sql`SELECT * FROM credit_tokens(${orderId}, ${transactionId || ''}, ${paymentType || ''}, ${sql.json(notification)})`;
      } catch (creditErr) {
        console.error('credit_tokens RPC failed:', creditErr);
        return res.status(500).json({ error: 'Failed to credit tokens' });
      }
    } else {
      const newStatus = transactionStatus === 'expire' ? 'expired'
        : transactionStatus === 'deny' ? 'denied' : 'failed';
      await sql`
        UPDATE payment_transactions SET status = ${newStatus}, raw_response = ${sql.json(notification)}
        WHERE order_id = ${orderId}
      `;
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Midtrans webhook error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/** POST /api/midtrans/snap-token */
export async function createTransaction(req, res) {
  const { purchase_id } = req.body;
  if (!purchase_id) return res.status(400).json({ error: 'purchase_id wajib diisi' });

  try {
    const [purchase] = await sql`
      SELECT id, tokens, amount, user_id, package_id
      FROM token_purchases WHERE id = ${purchase_id} AND user_id = ${req.user.id} AND status = 'pending'
      LIMIT 1
    `;
    if (!purchase) return res.status(404).json({ error: 'Pesanan tidak ditemukan atau sudah diproses' });

    const orderId = generateOrderId(purchase.user_id);
    const packageName = `${purchase.tokens} Token`;
    const snapToken = await createSnapTransaction(orderId, purchase.amount, packageName);

    await sql`
      INSERT INTO payment_transactions (user_id, order_id, package_id, tokens, amount, status, snap_token)
      VALUES (${purchase.user_id}, ${orderId}, ${purchase.package_id}, ${purchase.tokens}, ${purchase.amount}, 'pending', ${snapToken})
    `;

    res.json({ success: true, data: { snap_token: snapToken, order_id: orderId, purchase_id: purchase.id } });
  } catch (err) {
    console.error('createTransaction error:', err);
    res.status(500).json({ error: 'Gagal membuat transaksi pembayaran' });
  }
}
