import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useToastStore from '../store/toastStore'
import { authClient } from '../lib/authClient'

export default function useAuth() {
  const navigate = useNavigate()
  const { logout, isAuthenticated, user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)

  const signInWithGoogle = useCallback(async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    })
  }, [])

  const signOut = useCallback(async () => {
    await authClient.signOut()
    logout()
    addToast('Berhasil keluar', 'success')
    navigate('/')
  }, [logout, navigate, addToast])

  return { signInWithGoogle, signOut, isAuthenticated, user }
}
