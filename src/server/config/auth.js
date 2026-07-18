import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { config } from './env.js'
import { sendOtpEmail } from './mail.js'
import { assertOtpSendAllowed, recordOtpSend } from './otpRateLimit.js'
import * as schema from '../db/schema.js'

const sql = postgres(config.database.url)
const db = drizzle(sql)

const trustedOrigins = [
  ...config.cors.clientUrls,
  config.nodeEnv === 'production' ? 'https://gencv.muhzule.com' : 'http://localhost:5173',
].filter(Boolean)

export const auth = betterAuth({
  baseURL: config.nodeEnv === 'production' ? 'https://gencv.muhzule.com' : 'http://localhost:5000',
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
    },
    storeStateStrategy: 'database',
  },
  socialProviders: {
    google: {
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
      prompt: 'select_account',
      accessType: 'online',
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const gate = await assertOtpSendAllowed(email, { type })
        if (!gate.ok) {
          const err = new Error(gate.message)
          err.code = gate.code
          err.retryAfterSec = gate.retryAfterSec
          throw err
        }
        await sendOtpEmail({ email, otp, type })
        await recordOtpSend(email)
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await sql`
              INSERT INTO user_tokens (user_id, balance)
              VALUES (${user.id}, 5)
              ON CONFLICT (user_id) DO NOTHING
            `
          } catch (err) {
            console.error('[auth] failed to seed user_tokens', err.message)
          }
        },
      },
    },
  },
})
