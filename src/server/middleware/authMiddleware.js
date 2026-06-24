import { config } from '../config/env.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.slice(7);

  try {
    const res2 = await fetch(`${config.insforge.url}/api/auth/sessions/current`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: config.insforge.anonKey || config.insforge.serviceKey,
      },
    });

    if (!res2.ok) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const body = await res2.json();
    if (!body?.user?.id) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = body.user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
