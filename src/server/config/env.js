import dotenv from 'dotenv';
import { existsSync } from 'fs';

// Load env file based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;
if (existsSync(envFile)) {
  dotenv.config({ path: envFile });
}
dotenv.config(); // .env always loaded as base

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
};
