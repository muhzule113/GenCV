import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../../services/api'

const POLL_INTERVAL = 3000

/** Bank-specific payment steps */
const paymentSteps = {
  bca_va: [
    'Buka menu "m-BCA" atau "KlikBCA"',
    'Pilih "Pembayaran" > "Virtual Account"',
    'Masukkan nomor Virtual Account di atas',
    'Konfirmasi pembayaran',
  ],
  bni_va: [
    'Buka menu "Transfer" > "Virtual Account BNI"',
    'Masukkan nomor Virtual Account di atas',
    'Konfirmasi pembayaran',
  ],
  bri_va: [
    'Buka menu "Pembayaran" > "BRIVA"',
    'Masukkan nomor Virtual Account di atas',
    'Konfirmasi pembayaran',
  ],
  mandiri_va: [
    'Buka menu "Pembayaran" > "Buat Pembayaran"',
    'Pilih "Lainnya" > "Multipayment"',
    'Masukkan kode billing di atas',
    'Konfirmasi pembayaran',
  ],
  permata_va: [
    'Buka menu "Transfer" > "Virtual Account"',
    'Masukkan nomor Virtual Account di atas',
    'Konfirmasi pembayaran',
  ],
  gopay: [
    'Buka aplikasi Gojek',
    'Scan QR Code yang tersedia',
    'Konfirmasi pembayaran di aplikasi Gojek',
  ],
}

/** Method display name */
const methodLabels = {
  bca_va: 'BCA Virtual Account',
  bni_va: 'BNI Virtual Account',
  bri_va: 'BRI Virtual Account',
  mandiri_va: 'Mandiri Virtual Account',
  permata_va: 'Permata Virtual Account',
  gopay: 'GoPay',
  bca: 'BCA Virtual Account',
  bni: 'BNI Virtual Account',
  bri: 'BRI Virtual Account',
  mandiri: 'Mandiri Virtual Account',
  permata: 'Permata Virtual Account',
}

export default function WaitingPayment({
  orderId,
  pkg,
  paymentMethod,
  vaNumber,
  billCode,
  qrUrl,
  onMinimize,
  onSuccess,
  onCancel,
}) {
  const [status, setStatus] = useState('pending')
  const [paymentData, setPaymentData] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const pollRef = useRef(null)

  const checkStatus = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/tokens/purchase/${orderId}/status`)
      const tx = data?.data

      if (!tx) {
        setError('Pesanan tidak ditemukan')
        return false
      }

      setPaymentData(tx)
      setStatus(tx.status)

      if (tx.status === 'settlement') {
        onSuccess?.(tx)
        return true
      }

      if (['deny', 'cancel', 'expire', 'failure'].includes(tx.status)) {
        setError(`Pembayaran ${tx.status}`)
        return false
      }

      return false
    } catch (err) {
      console.error('Poll status error:', err)
      return false
    }
  }, [orderId, onSuccess])

  useEffect(() => {
    checkStatus()

    pollRef.current = setInterval(async () => {
      const done = await checkStatus()
      if (done) {
        clearInterval(pollRef.current)
      }
    }, POLL_INTERVAL)

    return () => clearInterval(pollRef.current)
  }, [checkStatus])

  const formatPrice = (v) =>
    v ? 'Rp ' + Number(v).toLocaleString('id-ID') : ''

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback select text
    }
  }

  const methodLabel = methodLabels[paymentMethod] || paymentMethod
  const steps = paymentSteps[paymentMethod] || []
  const isVa = vaNumber || billCode

  /* ── SUCCESS ── */
  if (status === 'settlement') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-surface rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Pembayaran Berhasil!</h2>
          <p className="text-text-secondary mb-4">
            {paymentData?.tokens} Token telah ditambahkan ke akun kamu.
          </p>
          {paymentData?.payment_method && (
            <p className="text-sm text-text-secondary mb-4">
              Metode: {methodLabels[paymentData.payment_method] || paymentData.payment_method}
            </p>
          )}
          <button onClick={onCancel} className="btn-primary w-full">
            Kembali
          </button>
        </div>
      </div>
    )
  }

  /* ── ERROR ── */
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-surface rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Pembayaran Gagal</h2>
          <p className="text-text-secondary mb-4">{error}</p>
          <button onClick={onCancel} className="btn-primary w-full">
            Tutup
          </button>
        </div>
      </div>
    )
  }

  /* ── WAITING ── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl text-center max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-ink mb-1">Menunggu Pembayaran</h2>
        <p className="text-sm text-muted mb-5">{methodLabel}</p>

        {/* ── Payment instruction block ── */}
        {isVa && (
          <div className="bg-sheet rounded-xl p-5 mb-5 text-left">
            <div className="text-sm text-muted mb-1">Nomor Virtual Account</div>
            <div
              className="flex items-center justify-between gap-2 bg-white rounded-lg px-4 py-3 border border-border cursor-pointer hover:border-clip transition-colors"
              onClick={() => handleCopy(vaNumber || billCode)}
            >
              <span className="text-lg font-bold font-mono text-ink tracking-wider">
                {vaNumber || billCode}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded shrink-0 ${copied ? 'bg-green-100 text-green-700' : 'bg-clip/10 text-clip'}`}>
                {copied ? 'Tersalin' : 'Salin'}
              </span>
            </div>

            {/* Bill code (Mandiri) */}
            {billCode && (
              <div className="mt-3 p-3 bg-surface rounded-lg border border-border text-sm">
                <div className="text-muted">Biller Code: <span className="font-mono font-bold text-ink">{billCode}</span></div>
              </div>
            )}

            <div className="text-xs text-muted mt-3 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Klik nomor untuk menyalin
            </div>
          </div>
        )}

        {/* ── QR Code (GoPay) ── */}
        {qrUrl && (
          <div className="bg-sheet rounded-xl p-5 mb-5 text-center">
            <div className="text-sm text-muted mb-3">Scan QR Code</div>
            <div className="inline-block bg-white rounded-xl p-3 border border-border">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 object-contain mx-auto" />
            </div>
            <p className="text-xs text-muted mt-3">
              Buka Gojek &gt; Scan QR &gt; Konfirmasi
            </p>
          </div>
        )}

        {/* ── Steps ── */}
        {steps.length > 0 && (
          <div className="text-left mb-5">
            <h3 className="text-sm font-semibold text-ink mb-2">Cara Pembayaran:</h3>
            <ol className="space-y-2">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted">
                  <span className="w-5 h-5 rounded-full bg-clip/10 text-clip text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Summary ── */}
        <div className="bg-sheet rounded-xl p-4 mb-5 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Order ID</span>
            <span className="font-mono text-xs text-ink">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Total</span>
            <span className="font-semibold text-ink">{formatPrice(pkg?.price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Token</span>
            <span className="font-semibold text-ink">{pkg?.tokens}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Status</span>
            <span className="text-warning font-medium">Menunggu pembayaran</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          {onMinimize && (
            <button onClick={onMinimize} className="text-sm text-muted hover:text-ink transition-colors">
              Minimalisir
            </button>
          )}
          <button onClick={onCancel} className="text-sm text-muted hover:text-danger underline transition-colors">
            Batalkan
          </button>
        </div>
      </div>
    </div>
  )
}
