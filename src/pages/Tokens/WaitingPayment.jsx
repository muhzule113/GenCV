import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../../services/api'

const POLL_INTERVAL = 3000

export default function WaitingPayment({
  orderId,
  pkg,
  snapToken,
  onPayNow,
  onMinimize,
  onSuccess,
  onCancel,
}) {
  const [status, setStatus] = useState('pending')
  const [paymentData, setPaymentData] = useState(null)
  const [error, setError] = useState(null)
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
          {paymentData?.paymentMethod && (
            <p className="text-sm text-text-secondary mb-4">
              Metode: {paymentData.paymentMethod}
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
      <div className="bg-surface rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Menunggu Pembayaran</h2>
        <p className="text-text-secondary mb-6">
          Selesaikan pembayaran melalui jendela pembayaran yang sudah terbuka.
        </p>

        <div className="bg-surface-alt rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Order ID</span>
            <span className="font-mono text-xs">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Total</span>
            <span className="font-semibold">{formatPrice(pkg?.price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Token</span>
            <span className="font-semibold">{pkg?.tokens}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Status</span>
            <span className="text-yellow-600 font-medium">Menunggu</span>
          </div>
        </div>

        {/* Bayar Sekarang — reopen Snap popup */}
        {snapToken && onPayNow && (
          <button
            onClick={() => onPayNow(snapToken)}
            className="btn-primary w-full mb-3"
          >
            Bayar Sekarang
          </button>
        )}

        <p className="text-xs text-text-secondary mb-4">
          Halaman ini akan otomatis terupdate setelah pembayaran terkonfirmasi.
        </p>
        {onMinimize && (
          <button
            onClick={onMinimize}
            className="text-text-secondary hover:text-text text-sm mr-4"
          >
            Minimalisir
          </button>
        )}

        <button
          onClick={onCancel}
          className="text-text-secondary hover:text-text underline text-sm"
        >
          Batalkan pesanan
        </button>
      </div>
    </div>
  )
}
