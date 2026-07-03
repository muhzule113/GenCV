import { useEffect, lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import useToastStore from './store/toastStore'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/common/ProtectedRoute'
import Toast from './components/common/Toast'
import ConfirmDialogProvider from './components/common/ConfirmDialogProvider'
import ErrorBoundary from './components/ErrorBoundary'
import { FeatureFlagProvider } from './config/featureFlags'

// Route-level code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'))
const CVBuilderPage = lazy(() => import('./pages/CVBuilder/CVBuilderPage'))
const LetterBuilderPage = lazy(() => import('./pages/LetterBuilder/LetterBuilderPage'))
const SharedCVPage = lazy(() => import('./pages/SharedCV/SharedCVPage'))
const TokensPage = lazy(() => import('./pages/Tokens/TokensPage'))
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'))

const PageLoader = () => (
  <div className="min-h-screen bg-paper flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

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
      { path: '/', element: <Suspense fallback={<PageLoader />}><LandingPage /></Suspense> },
      { path: '/login', element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
      { path: '/register', element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense> },
      { path: '/dashboard', element: <Suspense fallback={<PageLoader />}><ProtectedRoute><DashboardPage /></ProtectedRoute></Suspense> },
      { path: '/cv/new', element: <Suspense fallback={<PageLoader />}><ProtectedRoute><CVBuilderPage /></ProtectedRoute></Suspense> },
      { path: '/cv/:id/edit', element: <Suspense fallback={<PageLoader />}><ProtectedRoute><CVBuilderPage /></ProtectedRoute></Suspense> },
      { path: '/letter/new', element: <Suspense fallback={<PageLoader />}><ProtectedRoute><LetterBuilderPage /></ProtectedRoute></Suspense> },
      { path: '/letter/:id/edit', element: <Suspense fallback={<PageLoader />}><ProtectedRoute><LetterBuilderPage /></ProtectedRoute></Suspense> },
      { path: '/tokens', element: <Suspense fallback={<PageLoader />}><ProtectedRoute><TokensPage /></ProtectedRoute></Suspense> },
      { path: '/profile', element: <Suspense fallback={<PageLoader />}><ProtectedRoute><ProfilePage /></ProtectedRoute></Suspense> },
      { path: '/cv/s/:token', element: <Suspense fallback={<PageLoader />}><SharedCVPage /></Suspense> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <FeatureFlagProvider>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </FeatureFlagProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
