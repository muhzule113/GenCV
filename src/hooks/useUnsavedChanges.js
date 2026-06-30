import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'

export default function useUnsavedChanges(isDirty) {
  const blocker = useBlocker(isDirty)

  useEffect(() => {
    if (!isDirty) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  return {
    blocked: blocker.state === 'blocked',
    proceed: blocker.proceed,
    reset: blocker.reset,
  }
}
