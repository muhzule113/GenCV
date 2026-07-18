import { useCallback, useEffect, useState } from 'react'
import { OTP_COOLDOWN_SEC, OTP_MAX_PER_DAY } from './otpConstants'

export { OTP_COOLDOWN_SEC, OTP_MAX_PER_DAY }

const apiBase = () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

/**
 * Shared OTP resend with client cooldown + server daily limit (5/day/email).
 */
export default function useOtpResend({ email, onToast }) {
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const [dailyBlocked, setDailyBlocked] = useState(false)

  useEffect(() => {
    if (cooldownLeft <= 0) return undefined
    const t = setInterval(() => {
      setCooldownLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [cooldownLeft])

  const startCooldown = useCallback((sec = OTP_COOLDOWN_SEC) => {
    setCooldownLeft(Math.max(0, Number(sec) || OTP_COOLDOWN_SEC))
  }, [])

  const resend = useCallback(async () => {
    if (!email?.trim() || resendLoading || cooldownLeft > 0 || dailyBlocked) {
      return { ok: false }
    }

    setResendLoading(true)
    try {
      const res = await fetch(`${apiBase()}/api/auth/email-otp/send-verification-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          type: 'email-verification',
        }),
      })

      let body = {}
      try {
        body = await res.json()
      } catch {
        body = {}
      }

      if (!res.ok) {
        const msg = body.message || body.error || 'Gagal kirim ulang kode'
        const code = body.code || ''

        if (code === 'OTP_DAILY_LIMIT' || /batas|besok/i.test(msg)) {
          setDailyBlocked(true)
        }
        if (code === 'OTP_COOLDOWN' || body.retryAfterSec) {
          startCooldown(body.retryAfterSec || OTP_COOLDOWN_SEC)
        }

        onToast?.(msg, 'error')
        return {
          ok: false,
          code,
          message: msg,
          alreadyRegistered: code === 'EMAIL_ALREADY_REGISTERED',
        }
      }

      startCooldown(OTP_COOLDOWN_SEC)
      onToast?.('Kode baru dikirim ke email', 'success')
      return { ok: true }
    } catch (err) {
      onToast?.(err?.message || 'Gagal kirim ulang kode', 'error')
      return { ok: false }
    } finally {
      setResendLoading(false)
    }
  }, [email, resendLoading, cooldownLeft, dailyBlocked, onToast, startCooldown])

  const resendLabel = dailyBlocked
    ? 'Batas harian tercapai — coba besok'
    : cooldownLeft > 0
      ? `Kirim ulang dalam ${cooldownLeft}d`
      : resendLoading
        ? 'Mengirim…'
        : 'Kirim ulang kode'

  return {
    resend,
    resendLoading,
    cooldownLeft,
    dailyBlocked,
    startCooldown,
    resendLabel,
    canResend: !resendLoading && cooldownLeft <= 0 && !dailyBlocked,
  }
}
