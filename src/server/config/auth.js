import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from './env.js';

const sql = postgres(config.database.url);
const db = drizzle(sql);

export const auth = betterAuth({
  baseURL: config.nodeEnv === 'production' ? 'https://gencv.muhzule.com' : 'http://localhost:5000',
  database: drizzleAdapter(db, { provider: 'pg' }),
  socialProviders: {
    google: {
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
    },
  },
  advanced: {
    defaultPasswordAuthentication: false, // Google-only
  },
});
