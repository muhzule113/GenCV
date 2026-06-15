import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  login: (user, session) => set({ user, session, isAuthenticated: true }),
  logout: () => set({ user: null, session: null, isAuthenticated: false }),
  setUser: (user) => set({ user }),
}))

export default useAuthStore
