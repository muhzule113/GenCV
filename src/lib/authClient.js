import { createAuthClient } from 'better-auth/client'
import { emailOTPClient } from 'better-auth/client/plugins'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [emailOTPClient()],
})

export function getAppOrigin() {
  if (typeof window !== 'undefined') {
    return import.meta.env.VITE_APP_URL || window.location.origin
  }
  return import.meta.env.VITE_APP_URL || 'http://localhost:5173'
}
