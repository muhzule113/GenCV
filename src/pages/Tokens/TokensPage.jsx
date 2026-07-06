import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import useMidtransSnap from '../../hooks/useMidtransSnap'
import Button from '../../components/common/Button'
import WaitingPayment from './WaitingPayment'

const PAYMENT_EXPIRY_MS = 3 * 60 * 1000 // 3 menit

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
  const [paymentPending, setPaymentPending] = useState(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const expiryTimer = useRef(null)
  const countdownTimer = useRef(null)
  const [remaining, setRemaining] = useState(PAYMENT_EXPIRY_MS)

  const insufficient = searchParams.get('insufficient') === '1'

  const { pay: snapPay, loading: snapLoading, error: snapError, clearError: clearSnapError } = useMidtransSnap()

  useEffect(() => {
    fetchTokenBalance()
  }, [fetchTokenBalance])

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      clearTimeout(expiryTimer.current)
      clearInterval(countdownTimer.current)
    }
  }, [])

  /* ── Helpers ── */
  const openSnap = (snapToken) => {
    clearSnapError()
    snapPay(snapToken).catch(() => {})
  }

  const startPayment = ({ order_id, snap_token, pkg }) => {
    const expiresAt = Date.now() + PAYMENT_EXPIRY_MS
    setPaymentPending({ order_id, pkg, snap_token, expires_at: expiresAt })
    setShowOverlay(true)

    clearTimeout(expiryTimer.current)
    expiryTimer.current = setTimeout(() => {
      setPaymentPending(null)
      setShowOverlay(false)
      clearInterval(countdownTimer.current)
    }, PAYMENT_EXPIRY_MS)

    clearInterval(countdownTimer.current)
    countdownTimer.current = setInterval(() => {
      const left = Math.max(0, expiresAt - Date.now())
      setRemaining(left)
      if (left <= 0) {
        clearInterval(countdownTimer.current)
      }
    }, 1000)
  }

  const clearPayment = () => {
    setPaymentPending(null)
    setShowOverlay(false)
    clearTimeout(expiryTimer.current)
    clearInterval(countdownTimer.current)
  }

  /* ── Handlers ── */
  const handlePurchase = async (pkg) => {
    if (paymentPending) {
      alert('Silahkan selesaikan pembayaran yang ada terlebih dahulu')
      return
    }

    setPurchasing(true)
    setSelectedPkg(pkg.id)
    clearSnapError()

    try {
      const { data } = await api.post('/api/tokens/purchase', { package_id: pkg.id })
      if (data?.success) {
        const { snap_token, order_id } = data.data
        if (snap_token) {
          openSnap(snap_token)
          startPayment({ order_id, snap_token, pkg })
        }
      }
    } catch (err) {
      console.error('Purchase failed:', err)
    } finally {
      setPurchasing(false)
      setSelectedPkg(null)
    }
  }

  const handlePaymentSuccess = async () => {
    await fetchTokenBalance()
  }

  const handleCancelPayment = () => {
    clearPayment()
  }

  const handlePayNow = (snapToken) => {
    openSnap(snapToken)
    setShowOverlay(true)
  }

  const formatCountdown = (ms) => {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m}:${s.toString().padStart(2, '0')}`
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
                Generate ringkasan CV &mdash; 1 token
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Generate surat lamaran &mdash; 1 token
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Rekomendasi skill &mdash; 1 token
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Analisis kecocokan lowongan &mdash; 1 token
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Import CV via OCR &mdash; 1 token
              </li>
            </ul>
          </div>

          {/* Snap error */}
          {snapError && (
            <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
              {snapError}
            </div>
          )}

          {/* Snap loading */}
          {snapLoading && (
            <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary text-center">
              Membuka halaman pembayaran...
            </div>
          )}

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

      {/* Floating badge (when minimized) */}
      {paymentPending && !showOverlay && (
        <button
          onClick={() => setShowOverlay(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all"
        >
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-medium">Menunggu Pembayaran</span>
          <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">
            {formatCountdown(remaining)}
          </span>
        </button>
      )}

      {/* WaitingPayment overlay */}
      {paymentPending && showOverlay && (
        <WaitingPayment
          orderId={paymentPending.order_id}
          pkg={paymentPending.pkg}
          snapToken={paymentPending.snap_token}
          onPayNow={handlePayNow}
          onMinimize={() => setShowOverlay(false)}
          onSuccess={handlePaymentSuccess}
          onCancel={handleCancelPayment}
        />
      )}
    </div>
  )
}
