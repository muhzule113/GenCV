import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import Button from '../../components/common/Button'
import DocumentCard from '../../components/common/DocumentCard'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import { dummyCVs, dummyLetters, dummyTemplates } from '../../data/dummyData'

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'all'
  const navigate = useNavigate()
  const [deleteModal, setDeleteModal] = useState(null)

  const setTab = (tab) => {
    if (tab === 'all') setSearchParams({})
    else setSearchParams({ tab })
  }

  const docs = [
    ...(activeTab === 'all' || activeTab === 'cv' ? dummyCVs.map((c) => ({ ...c, type: 'cv', templateName: dummyTemplates.find((t) => t.id === c.template_id)?.name })) : []),
    ...(activeTab === 'all' || activeTab === 'letter' ? dummyLetters.map((l) => ({ ...l, type: 'letter' })) : []),
  ].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))

  const tabs = [
    { key: 'all', label: 'Semua', count: dummyCVs.length + dummyLetters.length },
    { key: 'cv', label: 'CV', count: dummyCVs.length },
    { key: 'letter', label: 'Surat Lamaran', count: dummyLetters.length },
  ]

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

          {docs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  type={doc.type}
                  templateName={doc.templateName}
                  createdAt={doc.created_at}
                  updatedAt={doc.updated_at}
                  onEdit={() => navigate(doc.type === 'cv' ? `/cv/${doc.id}/edit` : `/letter/${doc.id}/edit`)}
                  onDownload={() => alert(`Download ${doc.title}`)}
                  onDuplicate={() => alert(`Duplikat ${doc.title}`)}
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
            <Button variant="danger" onClick={() => { setDeleteModal(null); alert('Dokumen dihapus') }}>Hapus</Button>
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
