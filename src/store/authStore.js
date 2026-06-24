import { create } from 'zustand'
import { insforge } from '../services/insforge'

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  login: (user, session) => set({ user, session, isAuthenticated: true, loading: false }),
  logout: () => set({ user: null, session: null, isAuthenticated: false, loading: false }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
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
  },
}))

export default useAuthStore
