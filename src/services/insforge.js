const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://INSFORGE_HOST_PLACEHOLDER'
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || ''

async function apiPost(path, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error || data?.message || 'Request failed'
    return { data: null, error: { message: msg } }
  }
  return { data, error: null }
}

function getSession() {
  const token = localStorage.getItem('access_token')
  if (!token) return { data: { session: null } }
  return { data: { session: { access_token: token } } }
}

export const insforge = {
  auth: {
    signUp: async (payload) => {
      const result = await apiPost('/api/auth/users', payload)
      if (!result.error && result.data?.accessToken) {
        localStorage.setItem('access_token', result.data.accessToken)
      }
      return result
    },
    signInWithPassword: async ({ email, password }) => {
      const result = await apiPost('/api/auth/sessions', { email, password })
      if (!result.error && result.data?.accessToken) {
        localStorage.setItem('access_token', result.data.accessToken)
      }
      return result
    },
    getSession,
    getUser: async () => {
      const token = localStorage.getItem('access_token')
      if (!token) return { data: { user: null }, error: { message: 'No token' } }
      const res = await fetch(`${baseUrl}/api/auth/sessions/current`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return { data: { user: null }, error: { message: 'Failed to get user' } }
      const data = await res.json()
      return { data: { user: data.user }, error: null }
    },
    verifyEmail: async ({ email, otp }) => {
      return await apiPost('/api/auth/email/verify', { email, otp })
    },
    resendVerificationEmail: async ({ email }) => {
      return await apiPost('/api/auth/email/send-verification', { email })
    },
    signOut: async () => {
      localStorage.removeItem('access_token')
      return { error: null }
    },
  },
}
