import { Link, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const navItems = [
 { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
 { path: '/dashboard?tab=cv', label: 'CV Saya', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
 { path: '/dashboard?tab=letter', label: 'Surat Lamaran', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
]

export default function Sidebar() {
 const location = useLocation()
 const { signOut } = useAuth()

 return (
 <aside className="hidden md:flex flex-col w-56 min-h-[calc(100vh-3.5rem)] bg-surface border-r border-border p-3">
 <nav className="flex-1 space-y-0.5">
 {navItems.map((item) => {
 const isActive = location.pathname + location.search === item.path || 
 (item.path === '/dashboard' && location.pathname === '/dashboard' && !location.search)
 return (
 <Link
 key={item.path}
 to={item.path}
 className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors
 ${isActive 
 ? 'bg-ink text-paper '
 : 'text-muted hover:text-ink hover:bg-ink/5'
 }
 `}
 >
 <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
 </svg>
 {item.label}
 </Link>
 )
 })}
 </nav>

 <div className="pt-3 border-t border-border space-y-0.5">
 <button onClick={signOut} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted hover:text-danger hover:bg-danger/5 transition-colors">
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
 </svg>
 Keluar
 </button>
 </div>
 </aside>
 )
}