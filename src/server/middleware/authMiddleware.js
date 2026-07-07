import { config } from '../config/env.js';
import { fetchWithTimeout } from '../config/http.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.slice(7);

  try {
    const res2 = await fetchWithTimeout(
      `${config.insforge.url}/api/auth/sessions/current`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: config.insforge.anonKey || config.insforge.serviceKey,
        },
      },
      8000,
    );

    // InsForge unavailable (5xx/network) — NOT an auth failure.
    // Return 503 so client retries instead of logging the user out.
    if (res2.status >= 500) {
      return res.status(503).json({ error: 'Layanan autentikasi sedang tidak tersedia' });
    }

    // Genuine auth rejection — only 401/403 from InsForge means bad token.
    if (res2.status === 401 || res2.status === 403) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!res2.ok) {
      return res.status(503).json({ error: 'Layanan autentikasi sedang tidak tersedia' });
    }

    const body = await res2.json();
    if (!body?.user?.id) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = body.user;

    const emailVerified = body.user?.email_verified ?? body.user?.emailVerified ?? false;
    if (!emailVerified) {
      return res.status(403).json({ error: 'Email belum diverifikasi. Silakan periksa email Anda.', code: 'EMAIL_NOT_VERIFIED' });
    }
    next();
  } catch (err) {
    // Network error / abort (timeout) — don't punish the user with logout.
    const isAbort = err?.name === 'AbortError';
    console.error('requireAuth upstream error:', isAbort ? 'timeout' : err.message);
    return res.status(503).json({ error: 'Layanan autentikasi sedang tidak tersedia' });
  }
}
