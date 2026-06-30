import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useAuth from '../../hooks/useAuth'
import Button from '../common/Button'
import Modal from '../common/Modal'

export default function Navbar({ onDashboard }) {
 const { isAuthenticated, loading, tokenBalance } = useAuthStore()
 const { signOut } = useAuth()
 const navigate = useNavigate()
 const location = useLocation()
 const [showLogoutModal, setShowLogoutModal] = useState(false)

 const scrollToSection = (id) => {
 if (location.pathname !== '/') {
 navigate('/', { state: { scrollTo: id } })
 return
 }
 const el = document.getElementById(id)
 if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
 }

 return (
  <nav className="sticky top-0 z-40 bg-surface border-b border-rule">
 <div className="container-page flex items-center justify-between h-14">
 <Link to="/" className="flex items-center gap-2 no-underline">
 <span className="font-display font-bold text-lg tracking-display text-ink ">GenCV</span>
 </Link>

 <div className="hidden md:flex items-center gap-6">
 <button type="button" onClick={() => scrollToSection('features')} className="text-sm text-muted hover:text-ink transition-colors">Fitur</button>
 <button type="button" onClick={() => scrollToSection('how-it-works')} className="text-sm text-muted hover:text-ink transition-colors">Cara Kerja</button>
 </div>

 <div className="flex items-center gap-3">
 {!loading && (isAuthenticated ? (
 <>
 <Link
   to="/tokens"
   className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full
     bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors"
   title="Sisa token AI"
 >
   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
   </svg>
   {tokenBalance ?? '...'}
 </Link>
  <Button size="sm" onClick={onDashboard || (() => navigate('/dashboard'))}>Dashboard</Button>
 <button
   type="button"
   onClick={() => setShowLogoutModal(true)}
   className="md:hidden p-2 text-muted hover:text-danger transition-colors"
   title="Keluar"
 >
   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
   </svg>
 </button>
 </>
 ) : (
 <>
 <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Masuk</Button>
 <Button size="sm" onClick={() => navigate('/register')}>Mulai Gratis</Button>
 </>
 ))}
 </div>
 </div>

 <Modal
 open={showLogoutModal}
 onClose={() => setShowLogoutModal(false)}
 title="Konfirmasi Keluar"
 size="sm"
 actions={
 <>
 <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>Batal</Button>
 <Button variant="danger" onClick={() => { setShowLogoutModal(false); signOut(); }}>Keluar</Button>
 </>
 }
 >
 <p className="text-sm text-muted">
 Apakah Anda yakin ingin keluar dari akun GenCV Anda?
 </p>
 </Modal>
 </nav>
 )
}