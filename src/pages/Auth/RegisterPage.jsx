import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import useAuthStore from '../../store/authStore'
import useToastStore from '../../store/toastStore'
import useOtpResend, { OTP_MAX_PER_DAY } from '../../hooks/useOtpResend'
import { authClient, getAppOrigin } from '../../lib/authClient'

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 2.9.7 3.6 1.4l2.4-2.4C16.5 3.7 14.5 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.7H12z" />
      <path fill="#34A853" d="M3.9 7.3l3 2.2C7.7 7.4 9.7 6.2 12 6.2c1.8 0 2.9.7 3.6 1.4l2.4-2.4C16.5 3.7 14.5 2.8 12 2.8 8.3 2.8 5.1 4.9 3.9 7.3z" />
      <path fill="#4A90E2" d="M12 21.2c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8l-3 2.3c1.3 2.6 4 4.9 8.1 4.9z" />
      <path fill="#FBBC05" d="M6.9 13.9c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7l-3-2.3C3.3 9.4 3 10.7 3 12s.3 2.6.9 3.8l3-1.9z" />
    </svg>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const addToast = useToastStore((s) => s.addToast)

  const [step, setStep] = useState('form') // form | otp
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { resend, canResend, resendLabel, startCooldown, dailyBlocked } = useOtpResend({
    email,
    onToast: addToast,
  })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const validate = () => {
    const next = {}
    if (!name.trim()) next.name = 'Nama wajib diisi'
    if (!email.trim()) next.email = 'Email wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Email tidak valid'
    if (!password) next.password = 'Password wajib diisi'
    else if (password.length < 6) next.password = 'Password minimal 6 karakter'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: `${getAppOrigin()}/dashboard`,
      })

      if (error) {
        addToast(error.message || 'Registrasi gagal', 'error')
        if (/sudah terdaftar|EMAIL_ALREADY/i.test(error.message || error.code || '')) {
          navigate('/login', { replace: true })
        }
        return
      }

      // OTP dikirim otomatis sekali via sendVerificationOnSignUp
      addToast('Kode verifikasi dikirim ke email kamu', 'success')
      setStep('otp')
      setOtp('')
      startCooldown()
    } catch (err) {
      addToast(err?.message || 'Registrasi gagal. Coba lagi.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim() || otp.trim().length < 6) {
      setErrors({ otp: 'Masukkan 6 digit kode verifikasi' })
      return
    }

    setLoading(true)
    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: email.trim(),
        otp: otp.trim(),
      })

      if (error) {
        addToast(error.message || 'Kode tidak valid', 'error')
        return
      }

      await bootstrap()
      addToast('Email terverifikasi. Selamat datang!', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      addToast(err?.message || 'Verifikasi gagal', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${getAppOrigin()}/dashboard`,
        errorCallbackURL: `${getAppOrigin()}/register`,
      })
      if (error) {
        addToast(error.message || 'Daftar dengan Google gagal', 'error')
        setGoogleLoading(false)
      }
    } catch (err) {
      addToast(err?.message || 'Daftar dengan Google gagal', 'error')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-2xl font-semibold text-ink tracking-display">
            GenCV
          </Link>
          <p className="text-sm text-muted mt-2">
            {step === 'otp' ? 'Masukkan kode verifikasi' : 'Buat akun gratis untuk mulai'}
          </p>
        </div>

        <div className="bg-surface border border-ink p-6 sm:p-8">
          {step === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
              <p className="text-sm text-muted">
                Kami kirim kode 6 digit ke <span className="text-ink font-medium">{email}</span>.
                Cek inbox / folder spam.
              </p>
              {dailyBlocked && (
                <p className="text-xs text-danger">
                  Batas {OTP_MAX_PER_DAY} kali kirim kode hari ini tercapai. Coba lagi besok.
                </p>
              )}
              <Input
                label="Kode verifikasi"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }))
                }}
                error={errors.otp}
                disabled={loading}
              />
              <Button type="submit" className="w-full" loading={loading}>
                Verifikasi & lanjut
              </Button>
              <div className="flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  className="text-ink underline underline-offset-2 hover:no-underline disabled:opacity-50 disabled:no-underline"
                  onClick={async () => {
                    const result = await resend()
                    if (result?.alreadyRegistered) {
                      navigate('/login', { replace: true })
                    }
                  }}
                  disabled={!canResend || loading}
                >
                  {resendLabel}
                </button>
                <button
                  type="button"
                  className="text-muted hover:text-ink"
                  onClick={() => setStep('form')}
                  disabled={loading}
                >
                  Ubah email
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleRegister} className="space-y-4" noValidate>
                <Input
                  label="Nama"
                  type="text"
                  autoComplete="name"
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  error={errors.name}
                  disabled={loading || googleLoading}
                />
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  error={errors.email}
                  disabled={loading || googleLoading}
                />
                <Input
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  error={errors.password}
                  disabled={loading || googleLoading}
                />

                <Button type="submit" className="w-full" loading={loading} disabled={googleLoading}>
                  Daftar
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-rule" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface px-3 text-muted uppercase tracking-wider">atau</span>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleGoogleSignUp}
                loading={googleLoading}
                disabled={loading}
              >
                <GoogleIcon />
                Daftar dengan Google
              </Button>

              <p className="text-sm text-muted text-center mt-6">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-ink font-medium underline underline-offset-2 hover:no-underline">
                  Masuk
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
