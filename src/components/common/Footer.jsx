import { Link } from 'react-router-dom'

export default function Footer() {
 return (
 <footer className="border-t border-border py-10">
 <div className="container-page">
 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
 <span className="font-display font-bold text-sm tracking-display text-ink ">GenCV</span>
 <div className="flex items-center gap-5 text-xs text-muted ">
 <Link to="/#features" className="hover:text-ink transition-colors">Fitur</Link>
 <Link to="/#how-it-works" className="hover:text-ink transition-colors">Cara Kerja</Link>
 </div>
 </div>
 <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted ">
 &copy; {new Date().getFullYear()} GenCV
 </div>
 </div>
 </footer>
 )
}