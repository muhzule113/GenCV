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

function createInitialData() {
  return {
    ...initialState,
    personal: { ...initialPersonal },
    skills: { technical: [], soft: [] },
    experiences: [],
    educations: [],
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
    set({
      cvData: {
        ...initialState,
        ...data,
        personal: { ...initialPersonal, ...(data.personal || {}) },
        skills: { technical: [], soft: [], ...(data.skills || {}) },
      },
    })
  },

  reset: () => set({ currentStep: 0, cvData: createInitialData(), templateId: 'ats-clean-v1', title: 'CV Baru' }),
}))

export default useCVStore
