import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import Button from '../../components/common/Button'
import DocumentCard from '../../components/common/DocumentCard'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import api from '../../services/api'
import useToastStore from '../../store/toastStore'

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'all'
  const navigate = useNavigate()
  const [deleteModal, setDeleteModal] = useState(null)
  const [cvs, setCvs] = useState([])
  const [letters, setLetters] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToastStore((s) => s.addToast)

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

  const setTab = (tab) => {
    if (tab === 'all') setSearchParams({})
    else setSearchParams({ tab })
  }

  const docs = useMemo(() => {
    const cvDocs = cvs.map((c) => ({
      id: c.id,
      title: c.title,
      type: 'cv',
      template_id: c.template_id,
      templateName: templateNameById[c.template_id],
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

  const tabs = [
    { key: 'all', label: 'Semua', count: cvs.length + letters.length },
    { key: 'cv', label: 'CV', count: cvs.length },
    { key: 'letter', label: 'Surat Lamaran', count: letters.length },
  ]

  const handleEdit = (doc) => {
    navigate(doc.type === 'cv' ? `/cv/${doc.id}/edit` : `/letter/${doc.id}/edit`)
  }

  const handleDownload = (doc) => {
    addToast(`Download ${doc.title} belum tersedia`, 'info')
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
        await api.delete(`/api/cv/${doc.id}`)
      } else {
        await api.delete(`/api/letter/${doc.id}`)
      }
      addToast('Dokumen berhasil dihapus', 'success')
      await fetchAll()
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal menghapus dokumen'
      addToast(message, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-surface-2 dark:bg-surface-dark">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 pb-20 md:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-h2 text-text-primary dark:text-text-primary-dark">Dokumen Saya</h1>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/cv/new')}>+ Buat CV</Button>
              <Button variant="secondary" onClick={() => navigate('/letter/new')}>+ Buat Surat</Button>
            </div>
          </div>

          <div className="flex gap-1 bg-surface-2 dark:bg-slate-800 p-1 rounded-lg mb-6 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-slate-700 text-text-primary dark:text-text-primary-dark shadow-sm'
                    : 'text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-5 animate-pulse h-40"
                />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-6 text-center">
              <p className="text-danger mb-4">{error}</p>
              <Button onClick={fetchAll}>Coba Lagi</Button>
            </div>
          ) : docs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <DocumentCard
                  key={`${doc.type}-${doc.id}`}
                  title={doc.title}
                  type={doc.type}
                  templateName={doc.templateName}
                  createdAt={doc.created_at}
                  updatedAt={doc.updated_at}
                  onEdit={() => handleEdit(doc)}
                  onDownload={() => handleDownload(doc)}
                  onDuplicate={() => handleDuplicate(doc)}
                  onDelete={() => setDeleteModal(doc)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Belum ada dokumen"
              description="Buat CV atau surat lamaran pertama Anda sekarang. Gratis dan mudah!"
              actionLabel="Buat CV Baru"
              onAction={() => navigate('/cv/new')}
            />
          )}
        </main>
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
        <p className="text-text-muted dark:text-text-muted-dark">
          Apakah Anda yakin ingin menghapus <strong className="text-text-primary dark:text-text-primary-dark">{deleteModal?.title}</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  )
}
