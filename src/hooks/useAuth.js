import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useToastStore from '../store/toastStore'
import { authClient, getAppOrigin } from '../lib/authClient'

export default function useAuth() {
  const navigate = useNavigate()
  const { logout, isAuthenticated, user, bootstrap } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)

  const signInWithGoogle = useCallback(async () => {
    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${getAppOrigin()}/dashboard`,
      errorCallbackURL: `${getAppOrigin()}/login`,
    })
    if (error) {
      addToast(error.message || 'Login Google gagal', 'error')
      throw error
    }
  }, [addToast])

  const signInWithEmail = useCallback(async ({ email, password }) => {
    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: `${getAppOrigin()}/dashboard`,
    })
    if (error) {
      addToast(error.message || 'Login gagal', 'error')
      throw error
    }
    await bootstrap()
  }, [addToast, bootstrap])

  const signOut = useCallback(async () => {
    await authClient.signOut()
    logout()
    addToast('Berhasil keluar', 'success')
    navigate('/')
  }, [logout, navigate, addToast])

  return { signInWithGoogle, signInWithEmail, signOut, isAuthenticated, user }
}
