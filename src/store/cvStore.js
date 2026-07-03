import { create } from 'zustand'

const initialPersonal = { name: '', jobTitle: '', email: '', phone: '', city: '', linkedin: '', github: '', portfolio: '' }

const initialState = {
  personal: { ...initialPersonal },
  summary: '',
  experiences: [],
  educations: [],
  skills: { technical: [], soft: [] },
  projects: [],
  certifications: [],
  languages: [],
  jobAnalysis: {
    jobDescription: '',
    position: '',
    result: null,
    loading: false,
  },
}

function loadProfile() {
  try {
    const raw = localStorage.getItem('gencv-profile')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function createInitialData() {
  const profile = loadProfile()
  if (!profile) return { ...initialState }

  return {
    ...initialState,
    personal: { ...initialPersonal, ...(profile.personal || {}) },
    summary: profile.summary || '',
    experiences: profile.experiences || [],
    educations: profile.educations || [],
    skills: profile.skills || { technical: [], soft: [] },
    projects: profile.projects || [],
    certifications: profile.certifications || [],
    languages: profile.languages || [],
  }
}

const useCVStore = create((set) => ({
  currentStep: 0,
  cvData: createInitialData(),
  templateId: 'ats-clean-v1',
  title: 'CV Baru',

  setStep: (step) => set({ currentStep: step }),
  setTemplateId: (id) => set({ templateId: id }),
  setTitle: (title) => set({ title }),
  updateData: (field, value) => set((state) => ({ cvData: { ...state.cvData, [field]: value } })),

  setCvData: (data) => {
    const profile = loadProfile()
    const merged = {
      ...initialState,
      ...data,
      personal: { ...initialPersonal, ...(profile?.personal || {}), ...(data.personal || {}) },
      skills: { technical: [], soft: [], ...(profile?.skills || {}), ...(data.skills || {}) },
    }
    set({ cvData: merged })
  },

  reset: () => set({ currentStep: 0, cvData: createInitialData(), templateId: 'ats-clean-v1', title: 'CV Baru' }),
}))

export default useCVStore
