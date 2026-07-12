import { Navigate } from 'react-router-dom'

// Registration is handled by Google OAuth via Better Auth
// This page redirects to login (sign-in handles everything)
export default function RegisterPage() {
  return <Navigate to="/login" replace />
}
