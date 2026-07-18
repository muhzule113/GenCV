import nodemailer from 'nodemailer'
import { config } from './env.js'
import logger from './logger.js'

let transporter = null

function resolveFromAddress() {
  const from = config.smtp.from || ''
  const emailInFrom = from.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]
  if (emailInFrom && !/alamat-pengirim|example\.com|gencv\.local/i.test(emailInFrom)) {
    return from.includes('<') ? from : `GenCV <${emailInFrom}>`
  }

  const user = config.smtp.user || ''
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user)) {
    return `GenCV <${user}>`
  }

  throw new Error(
    'SMTP_FROM harus email valid yang diizinkan Sumopod (contoh: GenCV <noreply@domainkamu.com>). Username SMTP Sumopod bukan alamat email.',
  )
}

function getTransporter() {
  if (transporter) return transporter
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) return null

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure || config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  })
  return transporter
}

/**
 * Send OTP email. In development without SMTP, logs the code to the server console.
 */
export async function sendOtpEmail({ email, otp, type }) {
  const subjectByType = {
    'email-verification': 'Kode verifikasi GenCV',
    'sign-in': 'Kode masuk GenCV',
    'forget-password': 'Kode reset password GenCV',
  }
  const subject = subjectByType[type] || 'Kode GenCV'
  const text = [
    `Kode verifikasi GenCV kamu: ${otp}`,
    '',
    'Kode berlaku 10 menit. Jangan bagikan ke siapa pun.',
    type === 'email-verification'
      ? 'Masukkan kode ini di halaman daftar untuk mengaktifkan akun.'
      : '',
  ].filter(Boolean).join('\n')

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="margin-bottom: 8px;">GenCV</h2>
      <p>Kode verifikasi kamu:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${otp}</p>
      <p style="color: #666; font-size: 14px;">Berlaku 10 menit. Jangan bagikan kode ini.</p>
    </div>
  `

  const mailer = getTransporter()
  if (!mailer) {
    logger.warn(`[email] SMTP not configured — OTP for ${email} (${type}): ${otp}`)
    return { delivered: false, otp }
  }

  const from = resolveFromAddress()
  try {
    const info = await mailer.sendMail({
      from,
      to: email,
      subject,
      text,
      html,
    })
    logger.info(`[email] OTP sent to ${email} via ${config.smtp.host} (messageId=${info.messageId || 'n/a'})`)
    return { delivered: true }
  } catch (err) {
    // Always surface OTP in logs if SMTP fails, so local testing is not blocked
    logger.error(`[email] SMTP send failed: ${err.message}`)
    logger.warn(`[email] Fallback OTP for ${email} (${type}): ${otp}`)
    return { delivered: false, otp, error: err.message }
  }
}

export async function verifySmtpConnection() {
  const mailer = getTransporter()
  if (!mailer) return { ok: false, reason: 'SMTP not configured' }
  try {
    await mailer.verify()
    return { ok: true, host: config.smtp.host, port: config.smtp.port, from: resolveFromAddress() }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}
