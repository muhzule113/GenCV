import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CVPreview from '../../components/cv/CVPreview'
import { PageLoader } from '../../components/common/Skeleton'

export default function SharedCVPage() {
 const { token } = useParams()
 const [cv, setCv] = useState(null)
 const [error, setError] = useState(null)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
 fetch(`${baseURL}/api/cv/shared/${token}`, { credentials: 'include' })
 .then((r) => r.json())
 .then((body) => {
 if (body.success) setCv(body.data)
 else setError(body.error || 'CV tidak ditemukan')
 })
 .catch(() => setError('Gagal memuat CV'))
 .finally(() => setLoading(false))
 }, [token])

 if (loading) return (
 <div className="min-h-screen flex items-center justify-center bg-paper ">
 <PageLoader text="Memuat CV..." />
 </div>
 )

 if (error) return (
 <div className="min-h-screen flex items-center justify-center bg-paper ">
 <div className="text-center p-8">
 <svg className="w-16 h-16 mx-auto text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
 </svg>
 <h2 className="text-lg font-semibold text-ink mb-1">{error}</h2>
 <p className="text-sm text-muted ">Link mungkin sudah tidak aktif atau CV telah dihapus.</p>
 </div>
 </div>
 )

 return (
 <div className="min-h-screen bg-paper ">
 <div className="max-w-4xl mx-auto py-6 px-4">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h1 className="text-lg font-semibold text-ink ">{cv.title}</h1>
 <p className="text-xs text-muted ">Dibagikan via GenCV</p>
 </div>
 </div>
 <CVPreview data={cv.data || {}} templateId={cv.template_id} />
 </div>
 </div>
 )
}
