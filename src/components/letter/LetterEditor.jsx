import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

export default function LetterEditor({ content, onChange, onDownload }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark">Hasil Surat</h3>
        {content && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigator.clipboard?.writeText(content)}>
              Salin
            </Button>
            <Button size="sm" onClick={onDownload}>Download PDF</Button>
          </div>
        )}
      </div>

      {content ? (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-card text-body text-text-primary dark:text-text-primary-dark font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 resize-vertical"
          rows={18}
        />
      ) : (
        <div className="bg-surface-2 dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-8 text-center">
          <svg className="w-12 h-12 text-text-muted dark:text-text-muted-dark mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-text-muted dark:text-text-muted-dark">Isi form di atas, lalu klik "Generate Surat" untuk menghasilkan surat lamaran.</p>
        </div>
      )}
    </div>
  )
}
