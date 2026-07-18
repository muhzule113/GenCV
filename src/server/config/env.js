import dotenv from 'dotenv';
import { existsSync } from 'fs';

// Load .env first, then .env.{NODE_ENV} overrides
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config();
const envFile = `.env.${nodeEnv}`;
if (existsSync(envFile)) {
  dotenv.config({ path: envFile, override: true });
}

function parseClientUrls(val) {
  return val ? val.split(',').map(s => s.trim()) : ['http://localhost:5173'];
}
export const config = {
  port: process.env.PORT || 5000,
  nodeEnv,
  database: {
    url: process.env.DATABASE_URL,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
  },
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    coreApiUrl: process.env.MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2',
    snapUrl: process.env.MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
  },
  cors: {
    clientUrls: parseClientUrls(process.env.CLIENT_URL),
  },
  smtp: {
    host: (process.env.SMTP_HOST || '').trim(),
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: (process.env.SMTP_USER || '').trim(),
    pass: (process.env.SMTP_PASS || '').trim(),
    from: (process.env.SMTP_FROM || process.env.SMTP_USER || 'GenCV <noreply@gencv.local>').trim(),
  },
};
