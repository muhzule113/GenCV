import postgres from 'postgres'
import { config } from './env.js'
import logger from './logger.js'

const sql = postgres(config.database.url)

export const OTP_COOLDOWN_SEC = 60
export const OTP_MAX_PER_DAY = 5

function jakartaDayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

/**
 * @returns {{
 *   exists: boolean,
 *   emailVerified?: boolean,
 *   hasGoogle?: boolean,
 *   hasCredential?: boolean,
 *   message?: string,
 * }}
 */
export async function getEmailRegistrationStatus(email) {
  const key = normalizeEmail(email)
  if (!key) return { exists: false }

  const [user] = await sql`
    SELECT id, email_verified
    FROM "user"
    WHERE lower(email) = ${key}
    LIMIT 1
  `
  if (!user) return { exists: false }

  const accounts = await sql`
    SELECT provider_id FROM account WHERE user_id = ${user.id}
  `
  const providers = accounts.map((a) => a.provider_id)
  const hasGoogle = providers.includes('google')
  const hasCredential = providers.includes('credential')
  const emailVerified = Boolean(user.email_verified)

  const message = hasGoogle
    ? 'Email sudah terdaftar dengan Google. Silakan masuk dengan Google.'
    : 'Email sudah terdaftar. Silakan masuk.'

  return {
    exists: true,
    emailVerified,
    hasGoogle,
    hasCredential,
    message,
  }
}

/**
 * @param {string} email
 * @param {{ type?: string }} [opts]
 * @returns {{ ok: true, remaining?: number } | { ok: false, code: string, message: string, retryAfterSec?: number, remaining?: number }}
 */
export async function assertOtpSendAllowed(email, opts = {}) {
  const key = normalizeEmail(email)
  if (!key) {
    return { ok: false, code: 'INVALID_EMAIL', message: 'Email tidak valid' }
  }

  const type = opts.type || 'email-verification'
  // Jangan kirim OTP verifikasi ke email yang sudah punya akun (Google / sudah verified).
  if (type === 'email-verification') {
    const status = await getEmailRegistrationStatus(key)
    if (status.exists && (status.emailVerified || status.hasGoogle)) {
      return {
        ok: false,
        code: 'EMAIL_ALREADY_REGISTERED',
        message: status.message,
      }
    }
  }

  const today = jakartaDayKey()
  const [row] = await sql`
    SELECT email, day_key, send_count, last_sent_at
    FROM otp_send_limits
    WHERE email = ${key}
    LIMIT 1
  `

  if (!row) return { ok: true, remaining: OTP_MAX_PER_DAY }

  const count = row.day_key === today ? Number(row.send_count) : 0
  if (count >= OTP_MAX_PER_DAY) {
    return {
      ok: false,
      code: 'OTP_DAILY_LIMIT',
      message: `Batas ${OTP_MAX_PER_DAY} kali kirim kode hari ini tercapai. Coba lagi besok.`,
      remaining: 0,
    }
  }

  const lastSent = new Date(row.last_sent_at).getTime()
  const elapsedSec = Math.floor((Date.now() - lastSent) / 1000)
  if (elapsedSec < OTP_COOLDOWN_SEC) {
    const retryAfterSec = OTP_COOLDOWN_SEC - elapsedSec
    return {
      ok: false,
      code: 'OTP_COOLDOWN',
      message: `Tunggu ${retryAfterSec} detik sebelum kirim ulang.`,
      retryAfterSec,
      remaining: OTP_MAX_PER_DAY - count,
    }
  }

  return { ok: true, remaining: OTP_MAX_PER_DAY - count }
}

export async function recordOtpSend(email) {
  const key = normalizeEmail(email)
  const today = jakartaDayKey()

  await sql`
    INSERT INTO otp_send_limits (email, day_key, send_count, last_sent_at)
    VALUES (${key}, ${today}, 1, NOW())
    ON CONFLICT (email) DO UPDATE SET
      send_count = CASE
        WHEN otp_send_limits.day_key = EXCLUDED.day_key THEN otp_send_limits.send_count + 1
        ELSE 1
      END,
      day_key = EXCLUDED.day_key,
      last_sent_at = NOW()
  `

  const [row] = await sql`
    SELECT send_count FROM otp_send_limits WHERE email = ${key} LIMIT 1
  `
  const count = Number(row?.send_count || 1)
  logger.info(`[email] OTP send recorded for ${key} (${count}/${OTP_MAX_PER_DAY} today)`)
  return {
    sendCount: count,
    remaining: Math.max(0, OTP_MAX_PER_DAY - count),
  }
}
