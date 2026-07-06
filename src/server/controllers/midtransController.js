import crypto from 'node:crypto';
import { config } from '../config/env.js';

const serviceHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${config.insforge.serviceKey}`,
};

function dbUrl(table) {
  return `${config.insforge.url}/api/database/records/${table}`;
}

function rpcUrl(fn) {
  return `${config.insforge.url}/api/database/rpc/${fn}`;
}

// Generate unique order_id: GENCV-{userShortId}-{timestamp}-{random}
function generateOrderId(userId) {
  const short = userId.replace(/-/g, '').slice(0, 8);
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `GENCV-${short}-${ts}-${rand}`;
}

// Get Midtrans Snap token
async function createSnapTransaction(orderId, grossAmount, itemName) {
  const auth = Buffer.from(config.midtrans.serverKey + ':').toString('base64');
  const body = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    item_details: [
      {
        id: orderId,
        price: grossAmount,
        quantity: 1,
        name: itemName,
        category: 'Token',
      },
    ],
    credit_card: {
      secure: true,
    },
    customer_details: {
      // Will be filled from user data if available
    },
  };

  const resp = await fetch(config.midtrans.snapUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Midtrans Snap error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  return data.token;
}

/** Verify Midtrans webhook notification signature */
export function verifySignature(orderId, statusCode, grossAmount, serverKey, signatureKey) {
  const hash = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest('hex');
  return hash === signatureKey;
}

/**
 * POST /api/midtrans/webhook
 * Receives Midtrans payment notification (no auth — signature-based verification)
 */
export async function handleWebhook(req, res) {
  try {
    const notification = req.body;

    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const transactionId = notification.transaction_id;
    const paymentType = notification.payment_type;

    // Verify signature
    if (!verifySignature(orderId, statusCode, grossAmount, config.midtrans.serverKey, signatureKey)) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Check if transaction_status indicates settlement / capture
    const isSuccess =
      transactionStatus === 'settlement' ||
      transactionStatus === 'capture' ||
      (transactionStatus === 'accept' && fraudStatus === 'accept');

    if (isSuccess) {
      // Idempotent: credit_tokens RPC handles double-credit protection
      const rpcResp = await fetch(rpcUrl('credit_tokens'), {
        method: 'POST',
        headers: {
          ...serviceHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_order_id: orderId,
          p_midtrans_tx_id: transactionId,
          p_payment_method: paymentType,
          p_raw: JSON.stringify(notification),
        }),
      });

      if (!rpcResp.ok) {
        const errText = await rpcResp.text();
        console.error('credit_tokens RPC failed:', errText);
        return res.status(500).json({ error: 'Failed to credit tokens' });
      }
    } else {
      // Update status to failed/expired/deny
      await fetch(
        `${dbUrl('payment_transactions')}?order_id=eq.${orderId}`,
        {
          method: 'PATCH',
          headers: serviceHeaders,
          body: JSON.stringify({
            status: transactionStatus === 'expire' ? 'expired' : transactionStatus === 'deny' ? 'denied' : 'failed',
            raw_response: JSON.stringify(notification),
          }),
        },
      );
    }

    // Always return 200 OK to Midtrans (they'll retry on non-200)
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Midtrans webhook error:', err);
    res.status(200).json({ status: 'ok' }); // Still return 200 to acknowledge receipt
  }
}

/**
 * POST /api/midtrans/snap-token
 * Create Midtrans Snap transaction for a purchase
 * Called by modifyPurchase after creating the pending purchase record
 */
export async function createTransaction(req, res) {
  const { purchase_id } = req.body;
  if (!purchase_id) {
    return res.status(400).json({ error: 'purchase_id wajib diisi' });
  }

  try {
    // Get purchase record
    const getResp = await fetch(
      `${dbUrl('token_purchases')}?id=eq.${purchase_id}&user_id=eq.${req.user.id}&status=eq.pending&select=id,tokens,amount,user_id`,
      { headers: serviceHeaders },
    );
    if (!getResp.ok) {
      return res.status(500).json({ error: 'Gagal memuat pesanan' });
    }
    const getData = await getResp.json();
    const purchase = Array.isArray(getData) ? getData[0] : null;
    if (!purchase) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan atau sudah diproses' });
    }

    // Generate order_id
    const orderId = generateOrderId(purchase.user_id);

    // Get user info for item name
    const packageName = `${purchase.tokens} Token`;

    // Create Midtrans Snap transaction
    const snapToken = await createSnapTransaction(orderId, purchase.amount, packageName);

    // Create payment_transactions record
    const payResp = await fetch(
      dbUrl('payment_transactions'),
      {
        method: 'POST',
        headers: {
          ...serviceHeaders,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          user_id: purchase.user_id,
          order_id: orderId,
          package_id: purchase.package_id,
          tokens: purchase.tokens,
          amount: purchase.amount,
          status: 'pending',
          snap_token: snapToken,
        }),
      },
    );
    if (!payResp.ok) {
      return res.status(500).json({ error: 'Gagal menyimpan transaksi' });
    }

    res.json({
      success: true,
      data: {
        snap_token: snapToken,
        order_id: orderId,
        purchase_id: purchase.id,
      },
    });
  } catch (err) {
    console.error('createTransaction error:', err);
    res.status(500).json({ error: 'Gagal membuat transaksi pembayaran' });
  }
}
