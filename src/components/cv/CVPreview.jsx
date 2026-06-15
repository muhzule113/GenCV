import { BlobProvider } from '@react-pdf/renderer'
import { ATSCleanTemplate } from './templates/ATSCleanTemplate'
import { ATSModernTemplate } from './templates/ATSModernTemplate'

export default function CVPreview({ data, templateId = 'ats-clean-v1' }) {
  const Template = templateId === 'ats-modern-v1' ? ATSModernTemplate : ATSCleanTemplate

  return (
    <div className="w-full bg-gray-100 dark:bg-slate-900 rounded-card overflow-hidden" style={{ minHeight: 400 }}>
      <BlobProvider document={<Template data={data} />}>
        {({ url, loading, error }) => {
          if (loading) {
            return (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-text-muted dark:text-text-muted-dark">Memuat preview...</p>
                </div>
              </div>
            )
          }
          if (error) {
            return (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <p className="text-sm text-danger">Gagal memuat preview</p>
                </div>
              </div>
            )
          }
          return (
            <iframe
              src={url}
              className="w-full border-0"
              style={{ height: '700px' }}
              title="CV Preview"
            />
          )
        }}
      </BlobProvider>
    </div>
  )
}
