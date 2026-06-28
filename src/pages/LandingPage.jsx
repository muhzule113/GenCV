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
    <div className="min-h-screen bg-grid">
      <Navbar />

      <section className="container-page py-24 md:py-32 text-center">
        <h1 className="font-display text-display-xl tracking-display text-ink max-w-4xl mx-auto">
          CV yang lolos ATS dalam hitungan menit
        </h1>
        <p className="text-body text-muted max-w-xl mx-auto mt-5 leading-relaxed">
          Isi data diri, biarkan kami urus format dan layout-nya. Hasil CV dan surat lamaran siap kirim, gratis.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}>{isAuthenticated ? 'Ke Dashboard' : 'Mulai Gratis'}</Button>
        </div>

        <div className="mt-16 mx-auto max-w-xl">
          <div className="border border-ink bg-surface p-5 md:p-6 text-left text-xs">
            <div className="font-display text-base font-semibold text-ink mb-1">REZA PRATAMA</div>
            <div className="text-muted mb-3 text-xs">reza@email.com &middot; +62 812-3456-7890 &middot; Jakarta</div>
            <div className="font-medium text-ink uppercase tracking-wide text-[10px] border-b border-ink pb-1 mb-2">
              Ringkasan Profil
            </div>
            <p className="text-muted mb-3 leading-relaxed">
              Full Stack Developer dengan 3 tahun pengalaman dalam membangun aplikasi web menggunakan React.js dan Node.js. Terbiasa bekerja dalam tim agile dan fokus pada performa serta user experience.
            </p>
            <div className="font-medium text-ink uppercase tracking-wide text-[10px] border-b border-ink pb-1 mb-2">
              Pengalaman Kerja
            </div>
            <div className="font-medium text-ink">Frontend Developer &mdash; PT Teknologi Nusantara</div>
            <div className="text-muted mb-1">Jan 2024 &ndash; Sekarang</div>
            <ul className="list-disc list-inside text-muted space-y-0.5">
              <li>Mengembangkan dashboard analitik dengan React.js</li>
              <li>Optimasi performa halaman hingga 40%</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="features" className="bg-surface border-y border-rule">
        <div className="container-page py-24">
          <div className="max-w-2xl mx-auto mb-14 text-center">
            <p className="font-mono text-[11px] tracking-widest text-clip uppercase mb-2">Fitur</p>
            <h2 className="font-display text-display tracking-display text-ink">
              Dirancang untuk lolos seleksi
            </h2>
            <p className="text-sm text-muted mt-3 max-w-lg mx-auto">
              Bukan sekadar template. Setiap elemen dioptimalkan untuk ATS dan recruiter.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'ATS-Ready', desc: 'Format satu kolom tanpa tabel. Dijamin lolos parsing ATS dan mudah dibaca recruiter.' },
              { title: 'AI Generate', desc: 'Ringkasan profil dan surat lamaran ditulis oleh AI. Personal dan relevan dengan posisi.' },
              { title: 'Instant PDF', desc: 'Download PDF langsung dari browser. Siap kirim tanpa perlu edit ulang.' },
            ].map((f) => (
              <div key={f.title} className="bg-paper p-8 border border-ink">
                <h3 className="font-display text-base font-semibold text-ink mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container-page py-24">
        <div className="max-w-2xl mx-auto mb-14 text-center">
          <p className="font-mono text-[11px] tracking-widest text-clip uppercase mb-2">Alur</p>
          <h2 className="font-display text-display tracking-display text-ink">
            Tiga langkah
          </h2>
          <p className="text-sm text-muted mt-3 max-w-lg mx-auto">
            Dari nol ke PDF siap kirim dalam waktu singkat.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Isi Data', desc: 'Lengkapi data diri, pengalaman, dan keahlian di form yang mudah.' },
            { step: '02', title: 'Generate', desc: 'AI menulis ringkasan profil dan surat lamaran yang personal.' },
            { step: '03', title: 'Download', desc: 'Download CV dan surat lamaran sebagai PDF siap kirim.' },
          ].map((s) => (
            <div key={s.title} className="bg-surface p-8 border border-ink">
              <span className="font-mono text-xs text-clip">{s.step}</span>
              <h3 className="font-display text-base font-semibold text-ink mt-1 mb-2">{s.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface border-y border-rule">
        <div className="container-page py-24 text-center">
          <h2 className="font-display text-display tracking-display text-ink mb-3">Siap membuat CV profesional?</h2>
          <p className="text-sm text-muted mb-6 max-w-md mx-auto">Gratis, tidak perlu kartu kredit. Ribuan pencari kerja sudah menggunakan GenCV.</p>
          {!isAuthenticated && <Button size="lg" onClick={() => navigate('/register')}>Mulai Gratis</Button>}
        </div>
      </section>

      <Footer />
    </div>
  )
}
