import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useThemeStore from './store/themeStore'
import useToastStore from './store/toastStore'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/common/ProtectedRoute'
import Toast from './components/common/Toast'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import CVBuilderPage from './pages/CVBuilder/CVBuilderPage'
import LetterBuilderPage from './pages/LetterBuilder/LetterBuilderPage'

function ToastContainer() {
  const { toasts, removeToast } = useToastStore()
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

export default function App() {
  const initTheme = useThemeStore((s) => s.initTheme)
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    initTheme()
    bootstrap()
  }, [initTheme, bootstrap])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/cv/new" element={<ProtectedRoute><CVBuilderPage /></ProtectedRoute>} />
        <Route path="/cv/:id/edit" element={<ProtectedRoute><CVBuilderPage /></ProtectedRoute>} />
        <Route path="/letter/new" element={<ProtectedRoute><LetterBuilderPage /></ProtectedRoute>} />
        <Route path="/letter/:id/edit" element={<ProtectedRoute><LetterBuilderPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
