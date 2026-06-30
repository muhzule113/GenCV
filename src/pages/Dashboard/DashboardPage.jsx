import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import Button from '../../components/common/Button'
import DocumentCard from '../../components/common/DocumentCard'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import { DocumentCardSkeleton } from '../../components/common/Skeleton'
import OCRImportModal from '../../components/cv/OCRImportModal'
import api from '../../services/api'
import { pdf } from '@react-pdf/renderer'
import { ATSCleanTemplate } from '../../components/cv/templates/ATSCleanTemplate'
import { ATSModernTemplate } from '../../components/cv/templates/ATSModernTemplate'
import { CoverLetterTemplate } from '../../components/letter/CoverLetterTemplate'
import useToastStore from '../../store/toastStore'
import DashboardRail from './DashboardRail'

export default function DashboardPage() {
 const [searchParams, setSearchParams] = useSearchParams()
 const activeTab = searchParams.get('tab') || 'all'
 const navigate = useNavigate()
 const [deleteModal, setDeleteModal] = useState(null)
 const [shareModal, setShareModal] = useState(null)
 const [ocrOpen, setOcrOpen] = useState(false)
 const [cvs, setCvs] = useState([])
 const [letters, setLetters] = useState([])
 const [templates, setTemplates] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const addToast = useToastStore((s) => s.addToast)
  const [cvWordCount, setCvWordCount] = useState(0)
  const [avgAtsScore, setAvgAtsScore] = useState(null)

 const templateNameById = useMemo(() => {
 const map = {}
 for (const t of templates) map[t.id] = t.name
 return map
 }, [templates])

 const fetchAll = async () => {
 setLoading(true)
 setError(null)
 try {
 const [cvRes, letterRes, tplRes] = await Promise.all([
 api.get('/api/cv', { params: { page: 1, limit: 100 } }),
 api.get('/api/letter', { params: { page: 1, limit: 100 } }),
 api.get('/api/templates'),
 ])
 setCvs(Array.isArray(cvRes.data?.data) ? cvRes.data.data : [])
 setLetters(Array.isArray(letterRes.data?.data) ? letterRes.data.data : [])
 setTemplates(Array.isArray(tplRes.data?.data) ? tplRes.data.data : [])
 } catch (err) {
 const message = err.response?.data?.error || 'Gagal memuat dokumen'
 setError(message)
 addToast(message, 'error')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchAll()
 }, [])
 
 useEffect(() => {
   if (!cvs.length || loading) return
   const toFetch = cvs.slice(0, Math.min(5, cvs.length))
   Promise.all(toFetch.map(cv =>
     api.get(`/api/cv/${cv.id}`).then(r => r.data.data).catch(() => null)
   )).then(async (details) => {
     const valid = details.filter(Boolean)
     if (!valid.length) { setAvgAtsScore(0); return }
 
     // Extract content objects — CV detail stores content in d.data
     const contents = valid.map(d => {
       const c = d.data || {}
       return {
         personal: c.personal || {},
         summary: c.summary || '',
         experiences: c.experiences || c.experience || [],
         educations: c.educations || c.education || [],
         skills: c.skills || {},
       }
     })
 
     // Word count: sum over text fields
     const words = contents.reduce((sum, d) => {
       let count = 0
       const p = d.personal
       count += (p.name || '').split(/\s+/).filter(Boolean).length
       count += (p.jobTitle || '').split(/\s+/).filter(Boolean).length
       count += (d.summary || '').split(/\s+/).filter(Boolean).length
       for (const exp of (d.experiences || [])) {
         count += (exp.position || '').split(/\s+/).filter(Boolean).length
         count += (exp.company || '').split(/\s+/).filter(Boolean).length
         for (const desc of (exp.description || [])) {
           count += desc.split(/\s+/).filter(Boolean).length
         }
       }
       for (const edu of (d.educations || [])) {
         count += (edu.degree || '').split(/\s+/).filter(Boolean).length
         count += (edu.institution || '').split(/\s+/).filter(Boolean).length
       }
       return sum + count
     }, 0)
     setCvWordCount(words)
 
     // Average ATS score
     const { calculateATSScore } = await import('../../utils/atsRules')
     const total = contents.reduce((sum, d) => sum + calculateATSScore(d).total, 0)
     setAvgAtsScore(Math.round(total / contents.length))
   })
 }, [cvs, loading])

 const setTab = (tab) => {
 if (tab === 'all') setSearchParams({})
 else setSearchParams({ tab })
 }

 const stats = useMemo(() => {
 const all = [...cvs, ...letters]
 const oneWeekAgo = new Date(Date.now() - 7 * 86400000)
 const activeThisWeek = all.filter((d) => new Date(d.updated_at) > oneWeekAgo).length
 return { total: all.length, totalCv: cvs.length, totalLetter: letters.length, activeThisWeek }
 }, [cvs, letters])
 
 const templateDistribution = useMemo(() => {
 const map = {}
 for (const cv of cvs) {
   const name = templateNameById[cv.template_id] || 'Unknown'
   map[name] = (map[name] || 0) + 1
 }
 return map
 }, [cvs, templateNameById])

 const docs = useMemo(() => {
 const cvDocs = cvs.map((c) => ({
 id: c.id,
 title: c.title,
 type: 'cv',
 template_id: c.template_id,
 templateName: templateNameById[c.template_id],
 share_token: c.share_token,
 created_at: c.created_at,
 updated_at: c.updated_at,
 }))
 const letterDocs = letters.map((l) => ({
 id: l.id,
 title: [l.position, l.company].filter(Boolean).join(' — ') || 'Surat Lamaran',
 type: 'letter',
 template_id: null,
 templateName: null,
 position: l.position,
 company: l.company,
 cv_id: l.cv_id,
 created_at: l.created_at,
 updated_at: l.updated_at,
 }))
 return [...cvDocs, ...letterDocs].sort(
 (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
 )
 }, [cvs, letters, templateNameById])

 const filteredDocs = useMemo(() => {
 if (activeTab === 'all') return docs
 return docs.filter((d) => d.type === activeTab)
 }, [docs, activeTab])
 const tabs = [
 { key: 'all', label: 'Semua', count: stats.total },
 { key: 'cv', label: 'CV', count: stats.totalCv },
 { key: 'letter', label: 'Surat Lamaran', count: stats.totalLetter },
 ]

const handleEdit = (doc) => {
  navigate(doc.type === 'cv' ? `/cv/${doc.id}/edit` : `/letter/${doc.id}/edit`)
}


 const handleDownload = async (doc) => {
 addToast(`Menyiapkan ${doc.type === 'cv' ? 'CV' : 'Surat'}...`, 'info')
 try {
 if (doc.type === 'cv') {
 const res = await api.get(`/api/cv/${doc.id}`)
 const cv = res.data.data
 const cvData = cv.data || {}
 const templateId = cv.template_id || 'ats-clean-v1'

 const pdfDocument = templateId === 'ats-modern-v1'
 ? <ATSModernTemplate data={cvData} />
 : <ATSCleanTemplate data={cvData} />

 const blob = await pdf(pdfDocument).toBlob()
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `${cvData.personal?.name?.replace(/\s+/g, '-') || 'CV'}-CV.pdf`
 a.click()
 URL.revokeObjectURL(url)
 addToast('CV berhasil di-download!', 'success')
 } else {
 const res = await api.get(`/api/letter/${doc.id}`)
 const letter = res.data.data
 const letterData = {
 ...letter,
 personal: letter.personal || {},
 city: letter.city || '',
 date: letter.letterDate || letter.date || '',
 }

 const pdfDocument = <CoverLetterTemplate data={letterData} />
 const blob = await pdf(pdfDocument).toBlob()
 const url = URL.createObjectURL(blob)

 const sanitize = (s) => String(s || '').trim().replace(/s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
 const name = sanitize(letterData.personal?.name) || 'Pelamar'
 const company = sanitize(letterData.company) || 'Perusahaan'

 const a = document.createElement('a')
 a.href = url
 a.download = `Surat_Lamaran_${name}_${company}.pdf`
 a.click()
 URL.revokeObjectURL(url)
 addToast('Surat berhasil di-download!', 'success')
 }
 } catch (err) {
 const message = err.response?.data?.error || 'Gagal mendownload dokumen'
 addToast(message, 'error')
 }
 }
 
 const handleExportAll = async () => {
   if (!cvs.length) {
     addToast('Tidak ada CV untuk diexport', 'info')
     return
   }
   addToast('Menyiapkan ekspor batch...', 'info')
   for (const doc of cvs) {
     await handleDownload({ ...doc, type: 'cv' })
     await new Promise(r => setTimeout(r, 500))
   }
   addToast('Ekspor batch selesai', 'success')
 }

 const handleDuplicate = async (doc) => {
 try {
 if (doc.type === 'cv') {
 await api.post(`/api/cv/${doc.id}/duplicate`, {})
 addToast('CV berhasil diduplikasi', 'success')
 } else {
 addToast('Duplikasi surat tidak didukung; buat surat baru dari CV', 'info')
 }
 await fetchAll()
 } catch (err) {
 const message = err.response?.data?.error || 'Gagal menduplikasi dokumen'
 addToast(message, 'error')
 }
 }

 const handleConfirmDelete = async () => {
 if (!deleteModal) return
 const doc = deleteModal
 setDeleteModal(null)
 try {
 if (doc.type === 'cv') {
 await api.delete("/api/cv/" + doc.id)
 } else {
 await api.delete("/api/letter/" + doc.id)
 }
 addToast('Dokumen berhasil dihapus', 'success')
 await fetchAll()
 } catch (err) {
 const message = err.response?.data?.error || 'Gagal menghapus dokumen'
 addToast(message, 'error')
 }
 }

 const handleShare = async (doc) => {
 try {
 const res = await api.post(`/api/cv/${doc.id}/share`)
 const { shared, share_token } = res.data.data
 if (shared) {
      const shareUrl = `${window.location.origin}/cv/s/${share_token}`
 setShareModal({ title: doc.title, url: shareUrl })
 } else {
 addToast('Link sharing dinonaktifkan', 'success')
 }
 await fetchAll()
 } catch (err) {
 addToast(err.response?.data?.error || 'Gagal mengubah status sharing', 'error')
 }
 }

 const copyShareLink = () => {
 if (shareModal?.url) {
 navigator.clipboard.writeText(shareModal.url)
 addToast('Link berhasil disalin!', 'success')
 }
 }

 const handleOCRImport = (data) => {
 setOcrOpen(false)
 navigate('/cv/new', { state: { ocrData: data } })
 }

 // Keyboard shortcuts — use ref to avoid stale closure on handleExportAll
 const shortcutRef = useRef({ navigate, handleExportAll })
 shortcutRef.current = { navigate, handleExportAll }
 useEffect(() => {
   const handler = (e) => {
     if ((!e.ctrlKey && !e.metaKey) || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
     const { navigate, handleExportAll } = shortcutRef.current
     if (e.key === 'n') { e.preventDefault(); navigate('/cv/new') }
     if (e.key === 'l') { e.preventDefault(); navigate('/letter/new') }
     if (e.key === 'e') { e.preventDefault(); handleExportAll() }
   }
   window.addEventListener('keydown', handler)
   return () => window.removeEventListener('keydown', handler)
 }, [])
 return (
 <div className="min-h-screen bg-paper">
 <Navbar />
 <div className="flex">
 <Sidebar />
 <main className="flex-1 px-5 py-6 sm:py-10 bg-grid">
 <div className="max-w-container">

 <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
 <div>
 <span className="font-mono text-[11px] tracking-widest text-clip uppercase">DOKUMEN</span>
 <h1 className="font-display text-h1 tracking-display text-ink mt-1">Dokumen Saya</h1>
 <p className="text-sm text-muted mt-1">Kelola dan buat CV serta surat lamaran pekerjaan Anda.</p>
 </div>
 <div className="flex gap-2">
 <Button size="sm" variant="ghost" onClick={() => setOcrOpen(true)}>
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 Import
 </Button>
 <Button size="sm" onClick={() => navigate('/cv/new')}>
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
 </svg>
 Buat CV
 </Button>
 <Button size="sm" variant="secondary" onClick={() => navigate('/letter/new')}>
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
 </svg>
 Buat Surat
 </Button>
 </div>
 </div>

 {/* Stats bar */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
 {[
 { label: 'Total', value: stats.total },
 { label: 'CV', value: stats.totalCv },
 { label: 'Surat', value: stats.totalLetter },
 { label: 'Minggu Ini', value: stats.activeThisWeek },
 ].map((s) => (
 <div key={s.label} className="card p-4">
 <p className="text-[11px] font-mono tracking-widest text-muted uppercase">{s.label}</p>
 <p className="text-display font-display text-ink mt-1">{s.value}</p>
 </div>
 ))}
 </div>

 <div className="flex gap-0 mb-8 border-b border-rule">
 {tabs.map((tab) => (
 <button
 key={tab.key}
 onClick={() => setTab(tab.key)}
 className={`px-4 py-3 text-xs font-mono tracking-widest uppercase transition-all duration-150 relative ${activeTab === tab.key ? "text-ink" : "text-muted hover:text-ink"}`}
 >
 {tab.label}
          <span className={"ml-2 " + (activeTab === tab.key ? "text-clip" : "text-muted")}>{tab.count}</span>
 {activeTab === tab.key && (
 <span className="absolute bottom-0 left-0 right-0 h-px bg-clip" />
 )}
 </button>
 ))}
 </div>

 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3, 4, 5, 6].map((i) => (
 <DocumentCardSkeleton key={i} />
 ))}
 </div>
 ) : error ? (
 <div className="card p-8 text-center border-border">
 <span className="font-mono text-[11px] tracking-widest text-danger uppercase">Error</span>
 <p className="text-muted my-4 text-sm">{error}</p>
 <Button onClick={fetchAll}>Coba Lagi</Button>
 </div>
 ) : filteredDocs.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredDocs.map((doc) => (
 <DocumentCard
  key={doc.id}
  title={doc.title}
  type={doc.type}
  templateName={doc.templateName}
  shared={!!doc.share_token}
  createdAt={doc.created_at}
  updatedAt={doc.updated_at}
  onEdit={() => handleEdit(doc)}
  onDownload={() => handleDownload(doc)}
 onDuplicate={() => handleDuplicate(doc)}
 onDelete={() => setDeleteModal(doc)}
 onShare={() => handleShare(doc)}
 />
 ))}
 </div>
 ) : (
 <div>
 <EmptyState
 icon={
 <svg className="w-12 h-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 }
 title={activeTab === 'letter' ? 'Belum ada surat lamaran' : activeTab === 'cv' ? 'Belum ada CV' : 'Belum ada dokumen'}
 description={activeTab === 'letter' ? 'Buat surat lamaran pertama Anda sekarang.' : activeTab === 'cv' ? 'Buat CV pertama Anda sekarang.' : 'Buat CV atau surat lamaran pertama Anda sekarang. Gratis dan mudah!'}
 actionLabel={activeTab === 'letter' ? 'Buat Surat Baru' : 'Buat CV Baru'}
 onAction={() => navigate(activeTab === 'letter' ? '/letter/new' : '/cv/new')}
 />

 {/* Template quick start */}
 {activeTab !== 'letter' && templates.length > 0 && (
 <div className="mt-8">
 <p className="font-mono text-[11px] tracking-widest text-muted uppercase mb-4">MULAI CEPAT — PILIH TEMPLATE</p>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {templates.slice(0, 3).map((tpl) => (
 <button
 key={tpl.id}
 type="button"
 onClick={() => navigate(`/cv/new?template=${tpl.id}`)}
 className="card p-5 text-left hover:border-ink transition-all duration-150"
 >
 <p className="text-sm font-medium text-ink mb-1">{tpl.name}</p>
 {tpl.description && (
 <p className="text-xs text-muted line-clamp-2">{tpl.description}</p>
 )}
 <span className="inline-block mt-3 text-[11px] font-mono text-clip tracking-widest uppercase">Buat &rarr;</span>
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </main>
   <DashboardRail
     stats={stats}
     templateDistribution={templateDistribution}
     cvWordCount={cvWordCount}
     avgAtsScore={avgAtsScore}
     onExportAll={handleExportAll}
   />
 
 </div>

 <Modal
 open={!!deleteModal}
 onClose={() => setDeleteModal(null)}
 title="Hapus Dokumen"
 actions={
 <>
 <Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button>
 <Button variant="danger" onClick={handleConfirmDelete}>Hapus</Button>
 </>
 }
 >
 <p className="text-sm text-muted">
 Apakah Anda yakin ingin menghapus <strong className="text-ink">{deleteModal?.title}</strong>?
 Tindakan ini tidak dapat dibatalkan.
 </p>
 </Modal>

 <Modal
 open={!!shareModal}
 onClose={() => setShareModal(null)}
 title="Bagikan CV"
 actions={
 <>
 <Button variant="secondary" onClick={() => setShareModal(null)}>Tutup</Button>
 <Button onClick={copyShareLink}>Salin Link</Button>
 </>
 }
 >
 <div>
 <p className="text-sm text-muted mb-3">
 Link publik untuk <strong className="text-ink">{shareModal?.title}</strong>:
 </p>
 <div className="flex items-center gap-2 p-3 border border-border">
 <input
 readOnly
 value={shareModal?.url || ''}
 className="flex-1 bg-transparent text-sm text-ink outline-none truncate"
 onClick={(e) => e.target.select()}
 />
 </div>
 <p className="text-xs text-muted mt-2">
 Siapapun dengan link ini dapat melihat CV Anda.
 </p>
 </div>
 </Modal>

 <OCRImportModal open={ocrOpen} onClose={() => setOcrOpen(false)} onImport={handleOCRImport} />
 </div>
 )
}
