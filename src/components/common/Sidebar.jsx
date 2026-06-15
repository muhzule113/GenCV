import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/dashboard?tab=cv', label: 'CV Saya', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { path: '/dashboard?tab=letter', label: 'Surat Lamaran', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
]

export default function Sidebar() {
  const location = useLocation()
  const { signOut } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-[calc(100vh-4rem)] bg-white dark:bg-slate-800 border-r border-border dark:border-border-dark p-4">
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname + location.search === item.path || 
            (item.path === '/dashboard' && location.pathname === '/dashboard' && !location.search)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors
                ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted dark:text-text-muted-dark hover:bg-surface-2 dark:hover:bg-slate-700'}
              `}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-border dark:border-border-dark space-y-2">
        <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-text-muted dark:text-text-muted-dark hover:bg-surface-2 dark:hover:bg-slate-700 transition-colors">
          {theme === 'light' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          )}
          {theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
        </button>
        <button onClick={signOut} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </div>
    </aside>
  )
}
