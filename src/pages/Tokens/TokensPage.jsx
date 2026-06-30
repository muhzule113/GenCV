import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import Button from '../../components/common/Button'

const packages = [
  { id: 'starter', name: 'Starter Pack', tokens: 10, price: 15000, desc: 'Cocok untuk percobaan' },
  { id: 'popular', name: 'Popular Pack', tokens: 25, price: 30000, desc: 'Paling laris' },
  { id: 'pro', name: 'Pro Pack', tokens: 60, price: 60000, desc: 'Untuk power user' },
]

export default function TokensPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { tokenBalance, fetchTokenBalance } = useAuthStore()
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [purchasing, setPurchasing] = useState(false)

  const insufficient = searchParams.get('insufficient') === '1'

  useEffect(() => {
    fetchTokenBalance()
  }, [fetchTokenBalance])

  const handlePurchase = async (pkg) => {
    setPurchasing(true)
    setSelectedPkg(pkg.id)
    try {
      const { data } = await api.post('/api/tokens/purchase', { package_id: pkg.id })
      if (data?.success) {
        // Payment gateway integration placeholder
        // For now, auto-confirm
        const confirmRes = await api.post('/api/tokens/confirm', { purchase_id: data.data.id })
        if (confirmRes.data?.success) {
          await fetchTokenBalance()
        }
      }
    } catch (err) {
      console.error('Purchase failed:', err)
    } finally {
      setPurchasing(false)
      setSelectedPkg(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-page py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="text-sm text-muted hover:text-ink transition-colors mb-2"
              >
                &larr; Kembali
              </button>
              <h1 className="text-2xl font-bold text-ink">Isi Token AI</h1>
              <p className="text-sm text-muted mt-1">
                Setiap penggunaan fitur AI membutuhkan <strong>1 token</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 border border-warning/20">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-lg font-bold text-warning">{tokenBalance ?? '...'}</span>
              <span className="text-xs text-muted">token</span>
            </div>
          </div>

          {/* Insufficient alert */}
          {insufficient && (
            <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
              Token Anda tidak mencukupi. Silakan isi token untuk melanjutkan menggunakan fitur AI.
            </div>
          )}

          {/* Token usage info */}
          <div className="mb-8 p-4 rounded-lg bg-surface-2 border border-border">
            <h3 className="text-sm font-semibold text-ink mb-2">Penggunaan Token</h3>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Generate ringkasan CV — 1 token
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Generate surat lamaran — 1 token
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Rekomendasi skill — 1 token
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Analisis kecocokan lowongan — 1 token
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Import CV via OCR — 1 token
              </li>
            </ul>
          </div>

          {/* Package grid */}
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-5 rounded-xl border border-border bg-surface-2 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-ink">{pkg.name}</h3>
                      {pkg.id === 'popular' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          POPULER
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted mt-0.5">{pkg.desc}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-ink">
                      {pkg.tokens} token
                    </div>
                    <div className="text-sm text-muted">
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-muted mb-2">
                    Rp {Math.round(pkg.price / pkg.tokens).toLocaleString('id-ID')} /token
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePurchase(pkg)}
                    loading={purchasing && selectedPkg === pkg.id}
                    className="w-full"
                  >
                    Beli {pkg.tokens} Token
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-xs text-muted text-center mt-8">
            Token tidak bisa dikembalikan. Pembayaran akan diproses secara aman.
          </p>
        </div>
      </div>
    </div>
  )
}
