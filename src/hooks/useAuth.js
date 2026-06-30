import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useToastStore from '../store/toastStore'
import { insforge } from '../services/insforge'

export default function useAuth() {
  const navigate = useNavigate()
  const { login, logout, isAuthenticated, user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password })
    if (error) {
      const errStr = typeof error.message === 'string' ? error.message.toLowerCase() : ''
      const codeStr = typeof error.code === 'string' ? error.code.toLowerCase() : ''
      const isInvalid = errStr.includes('invalid') || errStr.includes('password') || errStr.includes('credential') || errStr.includes('unauthorized') || codeStr.includes('unauthorized')
      const msg = isInvalid
        ? 'Email atau password salah. Silakan periksa kembali.'
        : (error.message || 'Gagal masuk. Silakan coba lagi.')
      addToast(msg, 'error')
      return { success: false, error: msg }
    }
    localStorage.setItem('access_token', data.accessToken)
    login(data.user, data)
    addToast('Berhasil masuk!', 'success')
    navigate('/dashboard')
    return { success: true }
  }, [login, navigate, addToast])

  const signUp = useCallback(async (email, password, options = {}) => {
    const { data, error } = await insforge.auth.signUp({ email, password, ...options })
    if (error) { addToast(error.message, 'error'); return false }
    if (!data.accessToken || !data.user?.emailConfirmed) {
      addToast('Kode verifikasi telah dikirim ke email Anda', 'success')
      return { email, needsVerification: true }
    }
    localStorage.setItem('access_token', data.accessToken)
    login(data.user, data)
    addToast('Akun berhasil dibuat!', 'success')
    navigate('/dashboard')
    return true
  }, [login, navigate, addToast])

  const signOut = useCallback(async () => {
    await insforge.auth.signOut()
    logout()
    addToast('Berhasil keluar', 'success')
    navigate('/')
  }, [logout, navigate, addToast])

  return { signIn, signUp, signOut, isAuthenticated, user }
}
