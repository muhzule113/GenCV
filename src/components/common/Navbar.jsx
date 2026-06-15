import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'
import Button from '../common/Button'

export default function Navbar() {
  const { isAuthenticated } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border dark:border-border-dark">
      <div className="container-page flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CV</span>
          </div>
          <span className="font-semibold text-text-primary dark:text-text-primary-dark">GenCV</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors">Beranda</Link>
          <Link to="/#features" className="text-sm text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors">Fitur</Link>
          <Link to="/#how-it-works" className="text-sm text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors">Cara Kerja</Link>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-text-muted dark:text-text-muted-dark hover:bg-surface-2 dark:hover:bg-slate-700 transition-colors" title="Toggle dark mode">
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
          {isAuthenticated ? (
            <Button size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Masuk</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Mulai Gratis</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
