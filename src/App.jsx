import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import useToastStore from './store/toastStore'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/common/ProtectedRoute'
import Toast from './components/common/Toast'
import ConfirmDialogProvider from './components/common/ConfirmDialogProvider'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import CVBuilderPage from './pages/CVBuilder/CVBuilderPage'
import LetterBuilderPage from './pages/LetterBuilder/LetterBuilderPage'
import SharedCVPage from './pages/SharedCV/SharedCVPage'
import TokensPage from './pages/Tokens/TokensPage'

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

function AppLayout() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const stopPolling = useAuthStore((s) => s.stopPolling)

  useEffect(() => {
    bootstrap()
    return () => stopPolling()
  }, [bootstrap, stopPolling])

  return (
    <>
      <Outlet />
      <ToastContainer />
      <ConfirmDialogProvider />
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
      { path: '/cv/new', element: <ProtectedRoute><CVBuilderPage /></ProtectedRoute> },
      { path: '/cv/:id/edit', element: <ProtectedRoute><CVBuilderPage /></ProtectedRoute> },
      { path: '/letter/new', element: <ProtectedRoute><LetterBuilderPage /></ProtectedRoute> },
      { path: '/letter/:id/edit', element: <ProtectedRoute><LetterBuilderPage /></ProtectedRoute> },
      { path: '/tokens', element: <ProtectedRoute><TokensPage /></ProtectedRoute> },
      { path: '/cv/s/:token', element: <SharedCVPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
