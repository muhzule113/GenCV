import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import Button from '../common/Button'

export default function Navbar() {
 const { isAuthenticated, loading } = useAuthStore()
 const navigate = useNavigate()
 const location = useLocation()

 const scrollToSection = (id) => {
 if (location.pathname !== '/') {
 navigate('/', { state: { scrollTo: id } })
 return
 }
 const el = document.getElementById(id)
 if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
 }

 return (
 <nav className="sticky top-0 z-40 bg-paper/90 backdrop-blur-sm border-b border-border ">
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
 <Button size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
 ) : (
 <>
 <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Masuk</Button>
 <Button size="sm" onClick={() => navigate('/register')}>Mulai Gratis</Button>
 </>
 ))}
 </div>
 </div>
 </nav>
 )
}