import { useState, useEffect, useRef, useCallback } from 'react'

export function useAutoSave(data, key, { delay = 1000, enabled = true } = {}) {
  const [status, setStatus] = useState('saved')
  const timerRef = useRef(null)
  const dataRef = useRef(data)
  const mountedRef = useRef(false)

  useEffect(() => {
    dataRef.current = data
  })

  useEffect(() => {
    if (!enabled) return
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (!timerRef.current) {
      setStatus('saving')
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        const draft = {
          data: dataRef.current,
          savedAt: new Date().toISOString(),
          version: 1,
        }
        localStorage.setItem(key, JSON.stringify(draft))
        setStatus('saved')
      } catch (e) {
        setStatus('error')
        console.error('Auto-save failed:', e)
      }
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, key, delay, enabled])

  const loadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed
    } catch {
      return null
    }
  }, [key])

  const deleteDraft = useCallback(() => {
    localStorage.removeItem(key)
  }, [key])

  const listDrafts = useCallback(() => {
    const drafts = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('gencv-draft-')) {
        try {
          const raw = localStorage.getItem(k)
          if (raw) {
            const parsed = JSON.parse(raw)
            drafts.push({
              key: k,
              name: k.replace('gencv-draft-', ''),
              savedAt: parsed.savedAt,
              type: parsed.data?.templateId ? 'cv' : 'letter',
            })
          }
        } catch { /* ignore */ }
      }
    }
    return drafts.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
  }, [])

  return { status, loadDraft, deleteDraft, listDrafts }
}

export function getDraftNames() {
  const names = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('gencv-draft-')) {
      names.push(k.replace('gencv-draft-', ''))
    }
  }
  return names
}
