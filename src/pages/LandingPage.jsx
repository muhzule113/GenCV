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
    <div className="min-h-screen bg-white dark:bg-surface-dark">
      <Navbar />

      <section className="container-page py-20 md:py-28 text-center">
        <h1 className="text-h1 md:text-5xl lg:text-6xl text-text-primary dark:text-text-primary-dark mb-6 max-w-3xl mx-auto">
          CV ATS-Friendly & Surat Lamaran dalam{' '}
          <span className="text-primary">Hitungan Menit</span>
        </h1>
        <p className="text-body text-text-muted dark:text-text-muted-dark max-w-2xl mx-auto mb-10">
          Buat CV yang lolos seleksi ATS dan surat lamaran profesional dengan bantuan AI.
          Cukup isi data diri, dan kami yang urus sisanya.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isAuthenticated && <Button size="lg" onClick={() => navigate('/register')}>Mulai Gratis</Button>}
          <Button variant="secondary" size="lg" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>{isAuthenticated ? 'Ke Dashboard' : 'Lihat Demo'}</Button>
        </div>

        <div className="mt-16 max-w-4xl mx-auto bg-surface-2 dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-6 shadow-card">
          <div className="aspect-[1.414/1] max-w-md mx-auto bg-white dark:bg-slate-700 rounded-lg p-6 text-left text-xs">
            <div className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-1">REZA PRATAMA</div>
            <div className="text-text-muted dark:text-text-muted-dark mb-3">reza@email.com | +62 812-3456-7890 | Jakarta</div>
            <div className="font-bold text-text-primary dark:text-text-primary-dark uppercase text-[10px] border-b border-border dark:border-border-dark pb-1 mb-2">Ringkasan Profil</div>
            <p className="text-text-muted dark:text-text-muted-dark mb-3">Full Stack Developer dengan 3 tahun pengalaman...</p>
            <div className="font-bold text-text-primary dark:text-text-primary-dark uppercase text-[10px] border-b border-border dark:border-border-dark pb-1 mb-2">Pengalaman Kerja</div>
            <div className="font-medium text-text-primary dark:text-text-primary-dark">Frontend Developer — PT Teknologi Nusantara</div>
            <div className="text-text-muted dark:text-text-muted-dark mb-1">Jan 2024 – Sekarang</div>
            <div className="text-text-muted dark:text-text-muted-dark">• Mengembangkan dashboard dengan React.js</div>
          </div>
        </div>
      </section>

      <section id="features" className="container-page py-20">
        <h2 className="text-h2 text-center text-text-primary dark:text-text-primary-dark mb-12">Fitur Unggulan</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '✓', title: 'ATS-Ready', desc: 'Format satu kolom tanpa tabel. Dijamin lolos parsing ATS dan mudah dibaca recruiter.' },
            { icon: '⚡', title: 'AI Generate', desc: 'Ringkasan profil dan surat lamaran ditulis oleh DeepSeek AI. Personal dan relevan.' },
            { icon: '📥', title: 'Instant PDF', desc: 'Download PDF langsung dari browser. Siap kirim tanpa perlu edit ulang.' },
          ].map((f) => (
            <div key={f.title} className="bg-surface-2 dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-8 shadow-card">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl mb-4">{f.icon}</div>
              <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-2">{f.title}</h3>
              <p className="text-body text-text-muted dark:text-text-muted-dark">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="container-page py-20">
        <h2 className="text-h2 text-center text-text-primary dark:text-text-primary-dark mb-12">Cara Kerja</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: '01', title: 'Isi Form', desc: 'Lengkapi data diri, pengalaman, dan keahlian di form multi-step yang mudah.' },
            { num: '02', title: 'Generate', desc: 'AI kami akan menulis ringkasan profil dan surat lamaran yang personal.' },
            { num: '03', title: 'Download', desc: 'Download CV dan surat lamaran sebagai PDF siap kirim ke perusahaan.' },
          ].map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl mx-auto mb-4">{s.num}</div>
              <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-2">{s.title}</h3>
              <p className="text-body text-text-muted dark:text-text-muted-dark">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20">
        <div className="bg-primary rounded-2xl p-12 md:p-16 text-center text-white">
          <h2 className="text-h2 text-white mb-4">Siap Membuat CV Profesional?</h2>
          <p className="text-body text-white/80 mb-8 max-w-lg mx-auto">Lebih dari 1.000 pencari kerja sudah menggunakan GenCV. Gratis, tidak perlu kartu kredit.</p>
          {!isAuthenticated && <Button variant="secondary" size="lg" onClick={() => navigate('/register')} className="bg-white !text-primary hover:bg-gray-100">Mulai Gratis</Button>}
        </div>
      </section>

      <Footer />
    </div>
  )
}
