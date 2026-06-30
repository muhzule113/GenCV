import { config } from '../config/env.js';

const serviceHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${config.insforge.serviceKey}`,
};

function rpcUrl(fn) {
  return `${config.insforge.url}/api/database/rpc/${fn}`;
}

/**
 * Middleware: atomically deducts 1 token BEFORE AI call proceeds.
 * On AI failure, controller must call refundToken(req).
 */
export async function requireToken(req, res, next) {
  try {
    const resp = await fetch(rpcUrl('deduct_token'), {
      method: 'POST',
      headers: serviceHeaders,
      body: JSON.stringify({ p_user_id: req.user.id }),
    });

    if (!resp.ok) {
      return res.status(500).json({ error: 'Token check gagal' });
    }

    const data = await resp.json();
    // deduct_token returns empty array when balance < 1
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(402).json({
        error: 'Token tidak mencukupi. Silakan isi token terlebih dahulu.',
        code: 'INSUFFICIENT_TOKENS',
      });
    }

    req.tokenUsed = true;
    req.tokenBalance = data[0].balance;
    next();
  } catch (err) {
    console.error('requireToken error:', err);
    return res.status(500).json({ error: 'Token check gagal' });
  }
}

/**
 * Refund 1 token — call from catch block when AI fails after deduction.
 */
export async function refundToken(req) {
  if (!req.tokenUsed) return;
  try {
    await fetch(rpcUrl('refund_token'), {
      method: 'POST',
      headers: serviceHeaders,
      body: JSON.stringify({ p_user_id: req.user.id }),
    });
    req.tokenUsed = false;
  } catch (err) {
    console.error('refundToken error:', err);
  }
}
