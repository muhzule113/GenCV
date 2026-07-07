import { config } from '../config/env.js';
import { fetchWithTimeout } from '../config/http.js';

const anonHeaders = {
  'Content-Type': 'application/json',
  apikey: config.insforge.anonKey,
};

/** POST /api/auth/register — proxy signup through Express with rate limit */
export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  try {
    const resp = await fetchWithTimeout(
      `${config.insforge.url}/api/auth/users`,
      {
        method: 'POST',
        headers: anonHeaders,
        body: JSON.stringify({ email, password, data: { name: name || '' } }),
      },
      10000,
    );

    const data = await resp.json();

    if (!resp.ok) {
      const msg = data?.error?.message || data?.error || data?.message || 'Gagal membuat akun';
      return res.status(resp.status).json({ error: msg, code: data?.code || 'SIGNUP_FAILED' });
    }

    if (data?.accessToken) {
      return res.json(data);
    }

    return res.json(data);
  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    console.error('register proxy error:', isAbort ? 'timeout' : err.message);
    return res.status(503).json({ error: 'Layanan registrasi sedang tidak tersedia' });
  }
}
