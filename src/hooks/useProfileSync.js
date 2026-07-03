import { useCallback } from 'react'
import api from '../services/api'
import useProfileStore from '../store/profileStore'
import useAuthStore from '../store/authStore'
import useToastStore from '../store/toastStore'

export default function useProfileSync() {
  const profile = useProfileStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const addToast = useToastStore((s) => s.addToast)

  const saveToCloud = useCallback(async () => {
    if (!isAuthenticated) return false
    try {
      const profileData = {
        personal: profile.personal,
        summary: profile.summary,
        experiences: profile.experiences,
        educations: profile.educations,
        skills: profile.skills,
        projects: profile.projects,
        certifications: profile.certifications,
        languages: profile.languages,
      }
      await api.put('/api/profile', profileData)
      return true
    } catch {
      return false
    }
  }, [isAuthenticated, profile])

  const loadFromCloud = useCallback(async () => {
    if (!isAuthenticated) return null
    try {
      const res = await api.get('/api/profile')
      if (res.data?.success && res.data?.data?.data) {
        const cloudData = res.data.data.data
        profile.syncFromCV(cloudData)
        return cloudData
      }
      return null
    } catch {
      return null
    }
  }, [isAuthenticated, profile])

  const syncUp = useCallback(async () => {
    const ok = await saveToCloud()
    if (ok) addToast('Profil disinkronkan ke cloud', 'success')
    else if (isAuthenticated) addToast('Gagal sinkronisasi ke cloud', 'error')
  }, [saveToCloud, addToast, isAuthenticated])

  const syncDown = useCallback(async () => {
    const data = await loadFromCloud()
    if (data) addToast('Profil dimuat dari cloud', 'success')
    else if (isAuthenticated) addToast('Belum ada profil di cloud', 'info')
  }, [loadFromCloud, addToast, isAuthenticated])

  return { saveToCloud, loadFromCloud, syncUp, syncDown }
}
