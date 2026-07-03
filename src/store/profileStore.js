import { create } from 'zustand'

const PROFILE_KEY = 'gencv-profile'

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveProfile(data) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }))
  } catch { /* ignore */ }
}

const defaultPersonal = {
  name: '', jobTitle: '', email: '', phone: '', city: '',
  linkedin: '', github: '', portfolio: '',
  address: '', birthPlace: '', birthDate: '', gender: '', lastEducation: '',
}

const initialProfile = {
  personal: { ...defaultPersonal },
  summary: '',
  experiences: [],
  educations: [],
  skills: { technical: [], soft: [] },
  projects: [],
  certifications: [],
  languages: [],
  savedAt: null,
}

const useProfileStore = create((set) => ({
  ...initialProfile,
  ...(loadProfile() || {}),

  updatePersonal: (field, value) => {
    set((state) => {
      const next = {
        ...state,
        personal: { ...state.personal, [field]: value },
      }
      saveProfile(next)
      return next
    })
  },

  syncFrom: (personal) => {
    set((state) => {
      const next = {
        ...state,
        personal: { ...state.personal, ...personal },
      }
      saveProfile(next)
      return next
    })
  },

  syncFromCV: (cvData) => {
    if (!cvData) return
    set((state) => {
      const merged = {
        ...state,
        personal: { ...state.personal, ...(cvData.personal || {}) },
        summary: cvData.summary || state.summary,
        experiences: cvData.experiences?.length ? cvData.experiences : state.experiences,
        educations: cvData.educations?.length ? cvData.educations : state.educations,
        skills: cvData.skills?.technical?.length || cvData.skills?.soft?.length ? cvData.skills : state.skills,
        projects: cvData.projects?.length ? cvData.projects : state.projects,
        certifications: cvData.certifications?.length ? cvData.certifications : state.certifications,
        languages: cvData.languages?.length ? cvData.languages : state.languages,
      }
      saveProfile(merged)
      return merged
    })
  },

  setSummary: (summary) => {
    set((state) => {
      const next = { ...state, summary }
      saveProfile(next)
      return next
    })
  },

  clearProfile: () => {
    localStorage.removeItem(PROFILE_KEY)
    set({ ...initialProfile })
  },
}))

export default useProfileStore
