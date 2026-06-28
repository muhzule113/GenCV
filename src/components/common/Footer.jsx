import { useNavigate, useLocation } from 'react-router-dom'

export default function Footer() {
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
  <footer className="border-t border-rule py-10">
 <div className="container-page">
 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
 <span className="font-display font-bold text-sm tracking-display text-ink ">GenCV</span>
 <div className="flex items-center gap-5 text-xs text-muted ">
 <button type="button" onClick={() => scrollToSection('features')} className="hover:text-ink transition-colors">Fitur</button>
 <button type="button" onClick={() => scrollToSection('how-it-works')} className="hover:text-ink transition-colors">Cara Kerja</button>
 </div>
 </div>
   <div className="mt-6 pt-6 border-t border-rule text-center text-xs text-muted ">
 &copy; {new Date().getFullYear()} GenCV
 </div>
 </div>
 </footer>
 )
}