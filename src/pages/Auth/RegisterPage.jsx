import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import useAuth from '../../hooks/useAuth'
import useAuthStore from '../../store/authStore'
import useToastStore from '../../store/toastStore'
import { insforge } from '../../services/insforge'

export default function RegisterPage() {
 const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
 const [showPassword, setShowPassword] = useState(false)
 const [loading, setLoading] = useState(false)
 const [errors, setErrors] = useState({})
 const [verifyModal, setVerifyModal] = useState(false)
 const [code, setCode] = useState('')
 const [verifying, setVerifying] = useState(false)
 const [pendingEmail, setPendingEmail] = useState('')
 const { signUp } = useAuth()
 const login = useAuthStore((s) => s.login)
 const addToast = useToastStore((s) => s.addToast)
 const navigate = useNavigate()

 const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

 const handleSubmit = async (e) => {
 e.preventDefault()
 const errs = {}
 if (!form.name.trim()) errs.name = 'Nama lengkap wajib diisi'
 if (!form.email) errs.email = 'Email wajib diisi'
 if (form.password.length < 6) errs.password = 'Password minimal 6 karakter'
 if (form.password !== form.confirmPassword) errs.confirmPassword = 'Konfirmasi password tidak cocok'
 if (Object.keys(errs).length) { setErrors(errs); return }
 setErrors({})
 setLoading(true)
 const result = await signUp(form.email, form.password, { data: { name: form.name } })
 setLoading(false)
 if (result?.needsVerification) {
 setPendingEmail(result.email)
 setVerifyModal(true)
 }
 }

 const handleVerify = async () => {
 if (!code.trim()) return
 setVerifying(true)
 const { data, error } = await insforge.auth.verifyEmail({ email: pendingEmail, otp: code })
 setVerifying(false)
 if (error) { addToast(error.message, 'error'); return }
 localStorage.setItem('access_token', data.accessToken)
 login(data.user, data)
 addToast('Email berhasil diverifikasi!', 'success')
 setVerifyModal(false)
 navigate('/dashboard')
 }

 const handleResend = async () => {
 const { error } = await insforge.auth.resendVerificationEmail({ email: pendingEmail })
 if (error) { addToast(error.message, 'error'); return }
 addToast('Kode verifikasi telah dikirim ulang', 'success')
 }

 return (
 <div className="min-h-screen bg-paper flex">
 <div className="hidden lg:flex w-[40%] bg-ink flex-col justify-center items-center p-12 relative overflow-hidden">
 <div className="relative z-10 text-center">
 <h2 className="font-display text-2xl font-bold tracking-display text-paper mb-3">Mulai Perjalanan Anda</h2>
 <p className="text-sm text-paper/60 ">Buat CV ATS-friendly dalam hitungan menit, gratis.</p>
 </div>
 </div>

 <div className="flex-1 flex items-center justify-center p-6">
 <div className="w-full max-w-sm">
 <div className="mb-8">
 <h1 className="font-display text-display tracking-display text-ink mb-2">Buat Akun</h1>
 <p className="text-sm text-muted ">
 Sudah punya akun?{' '}
 <Link to="/login" className="text-ink underline underline-offset-4 decoration-border hover:decoration-ink">Masuk</Link>
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <Input label="Nama Lengkap" type="text" placeholder="Nama Anda" value={form.name} onChange={update('name')} error={errors.name} />
 <Input label="Email" type="email" placeholder="nama@email.com" value={form.email} onChange={update('email')} error={errors.email} />
 <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 karakter" value={form.password} onChange={update('password')} error={errors.password} />
 <Input label="Konfirmasi Password" type={showPassword ? 'text' : 'password'} placeholder="Ulangi password" value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} />
 <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-muted hover:text-ink">
 {showPassword ? 'Sembunyikan' : 'Tampilkan'} password
 </button>
 <Button type="submit" className="w-full" size="lg" loading={loading}>Buat Akun</Button>
 </form>
 </div>
 </div>

 <Modal open={verifyModal} onClose={() => setVerifyModal(false)} title="Verifikasi Email" size="sm">
 <p className="text-sm text-muted mb-4">
 Kode verifikasi telah dikirim ke <strong className="text-ink ">{pendingEmail}</strong>.
 </p>
 <Input
 label="Kode Verifikasi"
 type="text"
 placeholder="Masukkan kode"
 value={code}
 onChange={(e) => setCode(e.target.value)}
 />
 <div className="flex justify-end gap-3 mt-5">
 <Button variant="ghost" onClick={handleResend}>Kirim Ulang</Button>
 <Button onClick={handleVerify} loading={verifying}>Verifikasi</Button>
 </div>
 </Modal>
 </div>
 )
}