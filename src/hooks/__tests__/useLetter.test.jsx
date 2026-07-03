import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useLetter from '../useLetter'
import api from '../../services/api'

// Mock api
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock Zustand stores
vi.mock('../../store/toastStore', () => ({
  default: vi.fn((selector) => {
    const state = {
      addToast: vi.fn()
    }
    return selector ? selector(state) : state
  })
}))

vi.mock('../../store/authStore', () => ({
  default: vi.fn((selector) => {
    const state = {
      fetchTokenBalance: vi.fn()
    }
    return selector ? selector(state) : state
  })
}))

describe('useLetter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      expect(result.current.letter).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.saving).toBe(false)
      expect(result.current.existingLetter).toBeNull()
    })
  })

  describe('saveLetter', () => {
    it('should create new letter successfully', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const mockLetterData = {
        cv_id: 'cv-123',
        position: 'Software Engineer',
        company: 'Tech Corp',
        content: 'Dear Hiring Manager...'
      }
      
      api.post.mockResolvedValue({
        data: { success: true, data: { id: 'letter-1', ...mockLetterData } }
      })

      await act(async () => {
        const success = await result.current.saveLetter(mockLetterData)
        expect(success).toBe(true)
      })

      expect(api.post).toHaveBeenCalledWith('/api/letter', expect.objectContaining({
        cv_id: 'cv-123',
        position: 'Software Engineer',
        company: 'Tech Corp',
        content: 'Dear Hiring Manager...'
      }))
    })

    it('should update existing letter successfully', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const existingLetter = {
        id: 'letter-1',
        cv_id: 'cv-123',
        position: 'Software Engineer',
        company: 'Tech Corp',
        content: 'Dear Hiring Manager...'
      }
      
      const updatedData = {
        ...existingLetter,
        position: 'Senior Software Engineer'
      }
      
      // Set existing letter
      act(() => {
        result.current.setLetter(existingLetter)
      })
      
      api.put.mockResolvedValue({
        data: { success: true, data: updatedData }
      })

      await act(async () => {
        const success = await result.current.saveLetter(updatedData)
        expect(success).toBe(true)
      })

      expect(api.put).toHaveBeenCalledWith('/api/letter/letter-1', expect.objectContaining({
        position: 'Senior Software Engineer'
      }))
    })

    it('should handle save error', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const mockLetterData = {
        cv_id: 'cv-123',
        position: 'Software Engineer',
        company: 'Tech Corp',
        content: 'Dear Hiring Manager...'
      }
      
      api.post.mockRejectedValue(new Error('Network error'))

      await act(async () => {
        const success = await result.current.saveLetter(mockLetterData)
        expect(success).toBe(false)
      })
    })

    it('should handle API error response', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const mockLetterData = {
        cv_id: 'cv-123',
        position: 'Software Engineer',
        company: 'Tech Corp',
        content: 'Dear Hiring Manager...'
      }
      
      const errorResponse = {
        response: {
          data: { error: 'CV tidak ditemukan' }
        }
      }
      
      api.post.mockRejectedValue(errorResponse)

      await act(async () => {
        const success = await result.current.saveLetter(mockLetterData)
        expect(success).toBe(false)
      })
    })
  })

  describe('deleteLetter', () => {
    it('should delete letter successfully', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const letterId = 'letter-1'
      
      api.delete.mockResolvedValue({
        data: { success: true }
      })

      await act(async () => {
        const success = await result.current.deleteLetter(letterId)
        expect(success).toBe(true)
      })

      expect(api.delete).toHaveBeenCalledWith(`/api/letter/${letterId}`)
      expect(result.current.letter).toBeNull()
    })

    it('should handle delete error', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const letterId = 'letter-1'
      
      api.delete.mockRejectedValue(new Error('Network error'))

      await act(async () => {
        const success = await result.current.deleteLetter(letterId)
        expect(success).toBe(false)
      })
    })
  })

  describe('generateLetter', () => {
    it('should generate letter successfully', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const mockForm = {
        cv_id: 'cv-123',
        position: 'Software Engineer',
        company: 'Tech Corp',
        companyField: 'Engineering',
        infoSource: 'LinkedIn',
        recipientTitle: 'HRD',
        highlights: ['React', 'Node.js'],
        personal: { name: 'John Doe' },
        attachments: ['cv'],
        customAttachment: '',
        city: 'Jakarta',
        letterDate: '2024-01-01',
        relevantExperience: '5 years'
      }
      
      const generatedData = {
        id: 'letter-1',
        cv_id: 'cv-123',
        content: 'Dear Hiring Manager, I am interested...'
      }
      
      api.post.mockResolvedValue({
        data: { 
          success: true, 
          data: generatedData
        }
      })

      await act(async () => {
        const data = await result.current.generateLetter(mockForm)
        expect(data).toEqual(generatedData)
      })

      expect(api.post).toHaveBeenCalledWith('/api/letter/generate', expect.objectContaining({
        cv_id: 'cv-123',
        position: 'Software Engineer',
        company: 'Tech Corp'
      }))
      expect(result.current.letter).toEqual(generatedData)
    })

    it('should handle generate error', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const mockForm = {
        cv_id: 'cv-123',
        position: 'Software Engineer',
        company: 'Tech Corp'
      }
      
      api.post.mockRejectedValue(new Error('Network error'))

      await act(async () => {
        const data = await result.current.generateLetter(mockForm)
        expect(data).toBeNull()
      })
    })

    it('should handle 409 conflict error', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const mockForm = {
        cv_id: 'cv-123',
        position: 'Software Engineer',
        company: 'Tech Corp'
      }
      
      const errorResponse = {
        response: {
          status: 409,
          data: { 
            error: 'Surat sudah ada',
            existing_id: 'existing-letter-1'
          }
        }
      }
      
      api.post.mockRejectedValue(errorResponse)

      await act(async () => {
        const data = await result.current.generateLetter(mockForm)
        expect(data).toBeNull()
      })

      expect(result.current.existingLetter).toEqual({ id: 'existing-letter-1' })
    })
  })

  describe('checkExistingLetter', () => {
    it('should find existing letter for CV', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const cvId = 'cv-123'
      const existingLetter = {
        id: 'letter-1',
        cv_id: cvId,
        position: 'Software Engineer',
        company: 'Tech Corp'
      }
      
      api.get.mockResolvedValue({
        data: { success: true, data: [existingLetter] }
      })

      await act(async () => {
        await result.current.checkExistingLetter(cvId)
      })

      expect(api.get).toHaveBeenCalledWith('/api/letter', { params: { cv_id: cvId, page: 1, limit: 1 } })
      expect(result.current.existingLetter).toEqual(existingLetter)
    })

    it('should handle no existing letter', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const cvId = 'cv-123'
      
      api.get.mockResolvedValue({
        data: { success: true, data: [] }
      })

      await act(async () => {
        await result.current.checkExistingLetter(cvId)
      })

      expect(result.current.existingLetter).toBeNull()
    })

    it('should handle check error', async () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      const cvId = 'cv-123'
      
      api.get.mockRejectedValue(new Error('Network error'))

      await act(async () => {
        await result.current.checkExistingLetter(cvId)
      })

      expect(result.current.existingLetter).toBeNull()
    })
  })

  describe('clearLetter', () => {
    it('should clear letter state', () => {
      const { result } = renderHook(() => useLetter(), { wrapper: createWrapper() })
      
      // Set some state
      act(() => {
        result.current.setLetter({ id: 'letter-1', content: 'test' })
      })

      // Clear it
      act(() => {
        result.current.clearLetter()
      })

      expect(result.current.letter).toBeNull()
    })
  })
})
