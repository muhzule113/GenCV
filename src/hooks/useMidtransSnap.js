import { useState, useCallback } from 'react'

const SNAP_SRC = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY

let snapPromise = null

function loadSnapScript() {
  if (snapPromise) return snapPromise

  snapPromise = new Promise((resolve, reject) => {
    if (window.snap) {
      resolve(window.snap)
      return
    }

    const script = document.createElement('script')
    script.src = SNAP_SRC
    script.setAttribute('data-client-key', CLIENT_KEY)
    script.onload = () => {
      // snap is available after script loads
      const check = () => {
        if (window.snap) {
          resolve(window.snap)
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    }
    script.onerror = () => {
      snapPromise = null
      reject(new Error('Gagal memuat Snap.js'))
    }
    document.body.appendChild(script)
  })

  return snapPromise
}

export default function useMidtransSnap() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pay = useCallback(async (snapToken) => {
    setLoading(true)
    setError(null)

    try {
      const snap = await loadSnapScript()
      return new Promise((resolve) => {
        snap.pay(snapToken, {
          onSuccess: (result) => {
            resolve({ status: 'success', result })
          },
          onPending: (result) => {
            resolve({ status: 'pending', result })
          },
          onError: (result) => {
            setError('Pembayaran gagal. Silakan coba lagi.')
            resolve({ status: 'error', result })
          },
          onClose: () => {
            // User closed the popup without completing payment
            resolve({ status: 'closed' })
          },
        })
      })
    } catch (err) {
      setError(err.message || 'Gagal memuat pembayaran')
      return { status: 'error', error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  return { pay, loading, error, clearError: () => setError(null) }
}
