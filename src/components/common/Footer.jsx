import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-surface-dark border-t border-border dark:border-border-dark py-12">
      <div className="container-page">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CV</span>
            </div>
            <span className="font-semibold text-text-primary dark:text-text-primary-dark">GenCV</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-muted dark:text-text-muted-dark">
            <Link to="/" className="hover:text-text-primary dark:hover:text-text-primary-dark transition-colors">Beranda</Link>
            <Link to="/#features" className="hover:text-text-primary dark:hover:text-text-primary-dark transition-colors">Fitur</Link>
            <Link to="/#how-it-works" className="hover:text-text-primary dark:hover:text-text-primary-dark transition-colors">Cara Kerja</Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border dark:border-border-dark text-center text-xs text-text-muted dark:text-text-muted-dark">
          &copy; {new Date().getFullYear()} GenCV. Dibuat untuk membantu pencari kerja tampil profesional.
        </div>
      </div>
    </footer>
  )
}
