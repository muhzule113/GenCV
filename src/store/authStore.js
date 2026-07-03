import { create } from 'zustand'
import { insforge } from '../services/insforge'
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
    } catch { /* token balance is best-effort */ }
  },
  startPolling: () => {
    const { isAuthenticated } = get()
    if (!isAuthenticated) return
    get().fetchTokenBalance()
    if (_pollTimer) clearInterval(_pollTimer)
    _pollTimer = setInterval(() => {
      if (get().isAuthenticated) {
        get().fetchTokenBalance()
      }
    }, 30000)
  },
  stopPolling: () => {
    if (_pollTimer) {
      clearInterval(_pollTimer)
      _pollTimer = null
    }
  },
  login: (user, session) => {
    set({ user, session, isAuthenticated: true, loading: false })
    get().startPolling()
  },
  logout: () => {
    get().stopPolling()
    set({ user: null, session: null, isAuthenticated: false, loading: false, tokenBalance: null })
  },
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setTokenBalance: (balance) => set({ tokenBalance: balance }),
  bootstrap: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ user: null, session: null, isAuthenticated: false, loading: false })
      return
    }
    const { data, error } = await insforge.auth.getUser()
    if (error || !data?.user) {
      localStorage.removeItem('access_token')
      set({ user: null, session: null, isAuthenticated: false, loading: false })
      return
    }
    set({ user: data.user, session: { access_token: token }, isAuthenticated: true, loading: false })
    get().fetchTokenBalance()
    get().startPolling()
  },
}))
export default useAuthStore
