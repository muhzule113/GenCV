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
 const result = await signIn(email, password)
 if (!result?.success) {
 if (result?.error) {
 setErrors({ auth: result.error })
 }
 setLoading(false)
 }
 }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-muted hover:text-ink transition-colors focus:outline-none"
      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
    >
      {showPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      )}
    </button>
  )

 return (
 <div className="min-h-screen bg-paper flex">
 <div className="hidden lg:flex w-[40%] bg-ink flex-col justify-center items-center p-12 relative overflow-hidden">
 <div className="relative z-10 text-center">
 <h2 className="font-display text-2xl font-bold tracking-display text-paper mb-3">Selamat Datang Kembali</h2>
 <p className="text-sm text-paper/60 ">Lanjutkan membuat CV dan surat lamaran profesional Anda.</p>
 </div>
 </div>

 <div className="flex-1 flex items-center justify-center p-6">
 <div className="w-full max-w-sm">
 <div className="mb-8">
 <h1 className="font-display text-display tracking-display text-ink mb-2">Masuk</h1>
 <p className="text-sm text-muted ">Belum punya akun?{' '}
 <Link to="/register" className="text-ink underline underline-offset-4 decoration-border hover:decoration-ink">Daftar sekarang</Link>
 </p>
 </div>
 {errors.auth && (
 <div className="p-3 bg-danger/10 border border-danger text-danger text-xs font-mono animate-cut-in flex items-center gap-2 mb-4">
 <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
 </svg>
 <span>{errors.auth}</span>
 </div>
 )}
 <form onSubmit={handleSubmit} className="space-y-4">
 <Input label="Email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
 <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} rightElement={passwordToggle} />
 <Button type="submit" className="w-full" size="lg" loading={loading}>Masuk</Button>
 </form>

  </div>
 </div>
 </div>
 )
}