import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import useAuth from '../../hooks/useAuth'
import useToastStore from '../../store/toastStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { signIn } = useAuth()
  const addToast = useToastStore((s) => s.addToast)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      addToast('Sesi Anda telah berakhir. Silakan masuk kembali.', 'warning')
    }
  }, [searchParams, addToast])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!email) errs.email = 'Email wajib diisi'
    if (!password) errs.password = 'Password wajib diisi'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    await signIn(email, password)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-surface-dark flex">
      <div className="hidden lg:flex w-[40%] bg-primary flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-90" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">CV</span>
          </div>
          <h2 className="text-3xl font-bold mb-3">Selamat Datang Kembali</h2>
          <p className="text-white/80 max-w-sm">Lanjutkan membuat CV dan surat lamaran profesional Anda.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-h1 text-text-primary dark:text-text-primary-dark mb-2">Masuk</h1>
            <p className="text-text-muted dark:text-text-muted-dark">Belum punya akun?{' '}
              <Link to="/register" className="text-primary hover:underline">Daftar sekarang</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <div>
              <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-text-muted dark:text-text-muted-dark mt-1 hover:text-primary">
                {showPassword ? 'Sembunyikan' : 'Tampilkan'} password
              </button>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading}>Masuk</Button>
          </form>

          <p className="mt-6 text-center text-xs text-text-muted dark:text-text-muted-dark">
            Demo: <strong>demo@email.com</strong> / <strong>demo123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
