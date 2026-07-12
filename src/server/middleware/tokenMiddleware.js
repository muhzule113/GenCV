import postgres from 'postgres';
import { config } from '../config/env.js';

const sql = postgres(config.database.url);

export async function requireToken(req, res, next) {
  try {
    const result = await sql`
      SELECT * FROM deduct_token(${req.user.id})
    `;

    if (!result || result.length === 0) {
      return res.status(402).json({
        error: 'Token tidak mencukupi. Silakan isi token terlebih dahulu.',
        code: 'INSUFFICIENT_TOKENS',
      });
    }

    req.tokenUsed = true;
    req.tokenBalance = result[0].balance;
    next();
  } catch (err) {
    console.error('requireToken error:', err);
    return res.status(500).json({ error: 'Token check gagal' });
  }
}

export async function refundToken(req) {
  if (!req.tokenUsed) return;
  try {
    await sql`SELECT * FROM refund_token(${req.user.id})`;
    req.tokenUsed = false;
  } catch (err) {
    console.error('refundToken error:', err);
  }
}
