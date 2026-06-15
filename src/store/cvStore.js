import { create } from 'zustand'

const initialState = {
  personal: { name: '', jobTitle: '', email: '', phone: '', city: '', linkedin: '', github: '', portfolio: '' },
  summary: '',
  experiences: [],
  educations: [],
  skills: { technical: [], soft: [] },
  projects: [],
  certifications: [],
  languages: [],
}

const useCVStore = create((set) => ({
  currentStep: 0,
  cvData: { ...initialState },
  templateId: 'ats-clean-v1',
  title: 'CV Baru',

  setStep: (step) => set({ currentStep: step }),
  setTemplateId: (id) => set({ templateId: id }),
  setTitle: (title) => set({ title }),
  updateData: (field, value) => set((state) => ({ cvData: { ...state.cvData, [field]: value } })),
  setCvData: (data) => set({ cvData: data }),
  reset: () => set({ currentStep: 0, cvData: { ...initialState }, templateId: 'ats-clean-v1', title: 'CV Baru' }),
}))

export default useCVStore
