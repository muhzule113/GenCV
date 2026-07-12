import { auth } from '../config/auth.js';

export async function requireAuth(req, res, next) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    avatar_url: session.user.image,
    email_verified: session.user.emailVerified,
  };

  next();
}
