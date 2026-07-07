import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import useToastStore from '../../store/toastStore'
import Button from '../../components/common/Button'
import PaymentMethodGrid from './PaymentMethodGrid'
import WaitingPayment from './WaitingPayment'

const PAYMENT_EXPIRY_MS = 3 * 60 * 1000

const packages = [
  { id: 'starter', name: 'Starter Pack', tokens: 10, price: 15000, desc: 'Cocok untuk percobaan' },
  { id: 'popular', name: 'Popular Pack', tokens: 25, price: 30000, desc: 'Paling laris' },
  { id: 'pro', name: 'Pro Pack', tokens: 60, price: 60000, desc: 'Untuk power user' },
]

export default function TokensPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [searchParams] = useSearchParams()
  const { tokenBalance, fetchTokenBalance } = useAuthStore()
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [step, setStep] = useState('select') // select | method | paying
  const [purchasing, setPurchasing] = useState(false)
  const [paymentPending, setPaymentPending] = useState(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const expiryTimer = useRef(null)
  const countdownTimer = useRef(null)
  const [remaining, setRemaining] = useState(PAYMENT_EXPIRY_MS)

  const insufficient = searchParams.get('insufficient') === '1'

  useEffect(() => {
    fetchTokenBalance()
  }, [fetchTokenBalance])

  useEffect(() => {
    return () => {
      clearTimeout(expiryTimer.current)
      clearInterval(countdownTimer.current)
    }
  }, [])

  const startPayment = ({ order_id, payment_method, vaNumber, billCode, qrUrl, pkg }) => {
    const expiresAt = Date.now() + PAYMENT_EXPIRY_MS
    setPaymentPending({ order_id, pkg, payment_method, vaNumber, billCode, qrUrl, expires_at: expiresAt })
    setShowOverlay(true)

    clearTimeout(expiryTimer.current)
    expiryTimer.current = setTimeout(() => {
      setPaymentPending(null)
      setShowOverlay(false)
      setStep('select')
      clearInterval(countdownTimer.current)
    }, PAYMENT_EXPIRY_MS)

    clearInterval(countdownTimer.current)
    countdownTimer.current = setInterval(() => {
      const left = Math.max(0, expiresAt - Date.now())
      setRemaining(left)
      if (left <= 0) clearInterval(countdownTimer.current)
    }, 1000)
  }

  const clearPayment = () => {
    setPaymentPending(null)
    setShowOverlay(false)
    setStep('select')
    clearTimeout(expiryTimer.current)
    clearInterval(countdownTimer.current)
  }

  const handlePackageSelect = (pkg) => {
    if (paymentPending) {
      addToast('Selesaikan pembayaran yang menunggu terlebih dahulu', 'warning')
      setShowOverlay(true)
      return
    }
    setSelectedPkg(pkg)
    setSelectedMethod(null)
    setStep('method')
  }

  const handleMethodSelect = async (methodId) => {
    if (paymentPending) {
      addToast('Selesaikan pembayaran yang menunggu terlebih dahulu', 'warning')
      setShowOverlay(true)
      return
    }
    setSelectedMethod(methodId)
    if (!selectedPkg) return

    setPurchasing(true)
    try {
      const { data } = await api.post('/api/tokens/charge', {
        package_id: selectedPkg.id,
        payment_method: methodId,
      })
      if (data?.success) {
        startPayment({
          order_id: data.data.order_id,
          payment_method: methodId,
          vaNumber: data.data.vaNumber,
          billCode: data.data.billCode,
          qrUrl: data.data.qrUrl,
          pkg: selectedPkg,
        })
      }
    } catch (err) {
      console.error('Charge failed:', err)
      const msg = err?.response?.data?.detail || 'Gagal memproses pembayaran'
      addToast(msg, 'error')
    } finally {
      setPurchasing(false)
    }
  }

  const handlePaymentSuccess = async () => {
    await fetchTokenBalance()
  }

  const handleBack = () => {
    setStep('select')
    setSelectedPkg(null)
    setSelectedMethod(null)
  }

  const handlePayNow = (snapToken) => {
    // Not used in Core API flow — VA doesn't need re-pay
  }

  const formatCountdown = (ms) => {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const renderSelectPackage = () => (
    <>
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
                <div className="text-lg font-bold text-ink">{pkg.tokens} token</div>
                <div className="text-sm text-muted">Rp {pkg.price.toLocaleString('id-ID')}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-muted mb-2">
                Rp {Math.round(pkg.price / pkg.tokens).toLocaleString('id-ID')} /token
              </div>
              <Button
                size="sm"
                onClick={() => handlePackageSelect(pkg)}
                className="w-full"
              >
                Beli {pkg.tokens} Token
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )

  const renderSelectMethod = () => (
    <div>
      <button
        onClick={handleBack}
        className="text-sm text-muted hover:text-ink transition-colors mb-4 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke paket
      </button>

      <div className="mb-6 p-4 rounded-xl bg-sheet border border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Paket</span>
          <span className="font-semibold text-ink">{selectedPkg?.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-muted">Total</span>
          <span className="font-bold text-ink">{selectedPkg?.tokens} token — Rp {selectedPkg?.price.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <h2 className="text-lg font-bold text-ink mb-4">Pilih Metode Pembayaran</h2>
      <PaymentMethodGrid
        selected={selectedMethod}
        onSelect={handleMethodSelect}
        disabled={purchasing}
      />

      {/* Loading overlay — muncul langsung pas klik metode */}
      {purchasing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-surface rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-ink mb-1">Memproses Pembayaran</h3>
            <p className="text-sm text-muted">Menghubungi server pembayaran...</p>
          </div>
        </div>
      )}
    </div>
  )

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
            <div className="flex items-center gap-3">
              {/* Minimized payment badge — left of token counter */}
              {paymentPending && !showOverlay && (
                <button
                  onClick={() => setShowOverlay(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-clip/10 border border-clip/30 text-clip hover:bg-clip/20 transition-all"
                >
                  <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-xs font-medium tabular-nums">{formatCountdown(remaining)}</span>
                </button>
              )}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 border border-warning/20">
                <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-lg font-bold text-warning">{tokenBalance ?? '...'}</span>
                <span className="text-xs text-muted">token</span>
              </div>
            </div>
          </div>

          {/* Insufficient alert */}
          {insufficient && (
            <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
              Token Anda tidak mencukupi. Silakan isi token untuk melanjutkan menggunakan fitur AI.
            </div>
          )}

          {/* Token usage info - hide during method selection */}
          {step === 'select' && (
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
          )}

          {/* Step: Select Package */}
          {step === 'select' && renderSelectPackage()}

          {/* Step: Select Payment Method */}
          {step === 'method' && renderSelectMethod()}

          {/* Footer note */}
          {step === 'select' && (
            <p className="text-xs text-muted text-center mt-8">
              Token tidak bisa dikembalikan. Pembayaran akan diproses secara aman.
            </p>
          )}
        </div>
      </div>


      {/* WaitingPayment overlay */}
      {paymentPending && showOverlay && (
        <WaitingPayment
          orderId={paymentPending.order_id}
          pkg={paymentPending.pkg}
          paymentMethod={paymentPending.payment_method}
          vaNumber={paymentPending.vaNumber}
          billCode={paymentPending.billCode}
          qrUrl={paymentPending.qrUrl}
          onMinimize={() => setShowOverlay(false)}
          onSuccess={handlePaymentSuccess}
          onCancel={clearPayment}
        />
      )}
    </div>
  )
}
