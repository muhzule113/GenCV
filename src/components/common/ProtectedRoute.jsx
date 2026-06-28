import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import Spinner from './Spinner'

export default function ProtectedRoute({ children }) {
 const { isAuthenticated, loading } = useAuthStore()
 const location = useLocation()

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-paper ">
 <Spinner size="lg" />
 </div>
 )
 }

 if (!isAuthenticated) {
 return <Navigate to="/login" state={{ from: location.pathname }} replace />
 }

 return children
}
