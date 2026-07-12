import { create } from 'zustand'
import { authClient } from '../lib/authClient'
import api from '../services/api'

let _pollTimer = null

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  tokenBalance: null,

  fetchTokenBalance: async () => {
    try {
      const { data } = await api.get('/api/tokens/balance')
      if (data?.success) {
        set({ tokenBalance: data.data.balance })
      }
    } catch { /* best-effort */ }
  },

  startPolling: () => {
    if (_pollTimer) clearInterval(_pollTimer)
    _pollTimer = setInterval(() => {
      if (get().isAuthenticated) get().fetchTokenBalance()
    }, 30000)
  },

  stopPolling: () => {
    if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null }
  },

  bootstrap: async () => {
    try {
      const { data: { user, session }, error } = await authClient.getSession()

      if (error || !session) {
        set({ loading: false })
        return
      }

      set({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.image,
        },
        session,
        isAuthenticated: true,
        loading: false,
      })
      get().fetchTokenBalance()
      get().startPolling()
    } catch {
      set({ loading: false })
    }
  },

  logout: () => {
    get().stopPolling()
    authClient.signOut()
    set({ user: null, session: null, isAuthenticated: false, loading: false, tokenBalance: null })
  },
}))

export default useAuthStore
