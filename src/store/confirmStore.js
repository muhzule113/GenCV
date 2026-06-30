import { create } from 'zustand'

const useConfirmStore = create((set, get) => ({
  confirm: null,
  resolver: null,
  requestConfirm: (message) => {
    return new Promise((resolve) => {
      set({ confirm: { message }, resolver: resolve })
    })
  },
  confirmAction: () => {
    const { resolver } = get()
    resolver?.(true)
    set({ confirm: null, resolver: null })
  },
  cancelConfirm: () => {
    const { resolver } = get()
    resolver?.(false)
    set({ confirm: null, resolver: null })
  },
}))

export default useConfirmStore
