import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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
    if (status === 402 && window.location.pathname !== '/tokens') {
      window.location.href = '/tokens?insufficient=1'
    }
    return Promise.reject(err)
  }
)

export default api
