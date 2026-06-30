import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => {
    const tokenBalance = res.data?.tokenBalance ?? res.data?.data?.tokenBalance
    if (tokenBalance != null) {
      import('../store/authStore').then((m) => {
        const store = m.default
        const current = store.getState().tokenBalance
        if (current !== tokenBalance) {
          store.getState().setTokenBalance(tokenBalance)
        }
      })
    }
    return res
  },
  (err) => {
    const status = err.response?.status
    if (status === 401) {
      localStorage.removeItem('access_token')
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=1'
      }
    }
    if (status === 402 && window.location.pathname !== '/tokens') {
      window.location.href = '/tokens?insufficient=1'
    }
    return Promise.reject(err)
  }
)

export default api
