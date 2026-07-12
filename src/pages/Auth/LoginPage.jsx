import { authClient } from '../../lib/authClient'

export default function LoginPage() {
  const signIn = () => {
    authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6">GenCV</h1>
        <button
          onClick={signIn}
          className="flex items-center gap-2 rounded-lg border px-6 py-3 shadow hover:bg-gray-50"
        >
          <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
