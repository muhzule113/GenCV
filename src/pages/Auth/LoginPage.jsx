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

 <form onSubmit={handleSubmit} className="space-y-4">
 <Input label="Email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
 <div>
 <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
 <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-muted mt-1 hover:text-ink">
 {showPassword ? 'Sembunyikan' : 'Tampilkan'} password
 </button>
 </div>
 <Button type="submit" className="w-full" size="lg" loading={loading}>Masuk</Button>
 </form>

 <p className="mt-6 text-center text-xs text-muted ">
 Demo: <span className="text-ink ">demo@email.com</span> / <span className="text-ink ">demo123</span>
 </p>
 </div>
 </div>
 </div>
 )
}