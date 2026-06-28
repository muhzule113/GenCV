import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/common/Button'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import useAuthStore from '../store/authStore'

export default function LandingPage() {
 const navigate = useNavigate()
 const location = useLocation()
 const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

 useEffect(() => {
 const target = location.state?.scrollTo
 if (!target) return
 const el = document.getElementById(target)
 if (el) {
 setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
 }
 window.history.replaceState({}, '')
 }, [location.state])

 return (
 <div className="min-h-screen bg-paper ">
 <Navbar />

 <section className="container-page py-24 md:py-32 text-center">
 <h1 className="font-display text-display-xl tracking-display text-ink max-w-4xl mx-auto">
 CV yang lolos ATS dalam hitungan menit
 </h1>
 <p className="text-body text-muted max-w-xl mx-auto mt-5 leading-relaxed">
 Isi data diri, biarkan kami urus format dan layout-nya. Hasil CV dan surat lamaran siap kirim, gratis.
 </p>
 <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
 {!isAuthenticated && <Button size="lg" onClick={() => navigate('/register')}>Mulai Gratis</Button>}
 <Button variant="ghost" size="lg" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>{isAuthenticated ? 'Ke Dashboard' : 'Lihat Demo'}</Button>
 </div>

 <div className="mt-16 max-w-2xl mx-auto border border-border p-5 text-left text-xs">
 <div className="font-display text-base font-semibold text-ink mb-1">REZA PRATAMA</div>
 <div className="text-muted mb-3">reza@email.com | +62 812-3456-7890 | Jakarta</div>
 <div className="font-medium text-ink uppercase tracking-wide text-[10px] border-b border-border pb-1 mb-2">Ringkasan Profil</div>
 <p className="text-muted mb-3">Full Stack Developer dengan 3 tahun pengalaman...</p>
 <div className="font-medium text-ink uppercase tracking-wide text-[10px] border-b border-border pb-1 mb-2">Pengalaman Kerja</div>
 <div className="font-medium text-ink ">Frontend Developer — PT Teknologi Nusantara</div>
 <div className="text-muted mb-1">Jan 2024 – Sekarang</div>
 <div className="text-muted ">• Mengembangkan dashboard dengan React.js</div>
 </div>
 </section>

 <section id="features" className="container-page py-24">
 <div className="max-w-2xl mx-auto mb-14 text-center">
 <h2 className="font-display text-display tracking-display text-ink ">Fitur</h2>
 </div>
 <div className="grid md:grid-cols-3 gap-px bg-border ">
 {[
 { title: 'ATS-Ready', desc: 'Format satu kolom tanpa tabel. Dijamin lolos parsing ATS dan mudah dibaca recruiter.' },
 { title: 'AI Generate', desc: 'Ringkasan profil dan surat lamaran ditulis oleh AI. Personal dan relevan dengan posisi.' },
 { title: 'Instant PDF', desc: 'Download PDF langsung dari browser. Siap kirim tanpa perlu edit ulang.' },
 ].map((f) => (
 <div key={f.title} className="bg-paper p-8">
 <h3 className="font-display text-base font-semibold text-ink mb-2">{f.title}</h3>
 <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
 </div>
 ))}
 </div>
 </section>

 <section id="how-it-works" className="container-page py-24">
 <div className="max-w-2xl mx-auto mb-14 text-center">
 <h2 className="font-display text-display tracking-display text-ink ">Cara Kerja</h2>
 </div>
 <div className="grid md:grid-cols-3 gap-px bg-border ">
 {[
 { title: 'Isi Data', desc: 'Lengkapi data diri, pengalaman, dan keahlian di form yang mudah.' },
 { title: 'Generate', desc: 'AI menulis ringkasan profil dan surat lamaran yang personal.' },
 { title: 'Download', desc: 'Download CV dan surat lamaran sebagai PDF siap kirim.' },
 ].map((s) => (
 <div key={s.title} className="bg-paper p-8">
 <h3 className="font-display text-base font-semibold text-ink mb-2">{s.title}</h3>
 <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
 </div>
 ))}
 </div>
 </section>

 <section className="container-page pb-24">
 <div className="border border-ink p-10 md:p-14 text-center">
 <h2 className="font-display text-display tracking-display text-ink mb-3">Siap membuat CV profesional?</h2>
 <p className="text-sm text-muted mb-6 max-w-md mx-auto">Gratis, tidak perlu kartu kredit. Ribuan pencari kerja sudah menggunakan GenCV.</p>
 {!isAuthenticated && <Button size="lg" onClick={() => navigate('/register')}>Mulai Gratis</Button>}
 </div>
 </section>

 <Footer />
 </div>
 )
}