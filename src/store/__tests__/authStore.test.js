import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import useAuthStore from '../authStore'
import api from '../../services/api'
import { insforge } from '../../services/insforge'

// Mock dependencies
vi.mock('../../services/api')
vi.mock('../../services/insforge')

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      loading: true,
      tokenBalance: null,
    })
    vi.clearAllMocks()
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    // Stop polling after each test
    useAuthStore.getState().stopPolling()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.session).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.loading).toBe(true)
      expect(state.tokenBalance).toBeNull()
    })
  })

  describe('fetchTokenBalance', () => {
    it('should fetch and set token balance successfully', async () => {
      const mockBalance = 10
      api.get = vi.fn().mockResolvedValue({
        data: { success: true, data: { balance: mockBalance } }
      })

      await act(async () => {
        await useAuthStore.getState().fetchTokenBalance()
      })

      expect(api.get).toHaveBeenCalledWith('/api/tokens/balance')
      expect(useAuthStore.getState().tokenBalance).toBe(mockBalance)
    })

    it('should handle API error gracefully', async () => {
      api.get = vi.fn().mockRejectedValue(new Error('Network error'))

      await act(async () => {
        await useAuthStore.getState().fetchTokenBalance()
      })

      expect(api.get).toHaveBeenCalledWith('/api/tokens/balance')
      expect(useAuthStore.getState().tokenBalance).toBeNull()
    })

    it('should not set balance if response is not successful', async () => {
      api.get = vi.fn().mockResolvedValue({
        data: { success: false }
      })

      await act(async () => {
        await useAuthStore.getState().fetchTokenBalance()
      })

      expect(useAuthStore.getState().tokenBalance).toBeNull()
    })
  })

  describe('startPolling', () => {
    it('should not start polling if not authenticated', () => {
      useAuthStore.setState({ isAuthenticated: false })

      act(() => {
        useAuthStore.getState().startPolling()
      })

      expect(api.get).not.toHaveBeenCalled()
    })

    it('should fetch balance immediately when starting polling', async () => {
      useAuthStore.setState({ isAuthenticated: true })
      api.get = vi.fn().mockResolvedValue({
        data: { success: true, data: { balance: 5 } }
      })

      act(() => {
        useAuthStore.getState().startPolling()
      })

      expect(api.get).toHaveBeenCalledWith('/api/tokens/balance')
    })

    it('should poll every 30 seconds when authenticated', async () => {
      useAuthStore.setState({ isAuthenticated: true })
      api.get = vi.fn().mockResolvedValue({
        data: { success: true, data: { balance: 5 } }
      })

      act(() => {
        useAuthStore.getState().startPolling()
      })

      // Initial call
      expect(api.get).toHaveBeenCalledTimes(1)

      // Advance timer by 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000)
      })

      expect(api.get).toHaveBeenCalledTimes(2)

      // Advance timer by another 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000)
      })

      expect(api.get).toHaveBeenCalledTimes(3)
    })

    it('should not poll if user becomes unauthenticated', async () => {
      useAuthStore.setState({ isAuthenticated: true })
      api.get = vi.fn().mockResolvedValue({
        data: { success: true, data: { balance: 5 } }
      })

      act(() => {
        useAuthStore.getState().startPolling()
      })

      expect(api.get).toHaveBeenCalledTimes(1)

      // User logs out
      useAuthStore.setState({ isAuthenticated: false })

      // Advance timer by 3 seconds
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      // Should not have called again
      expect(api.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('stopPolling', () => {
    it('should stop polling interval', async () => {
      useAuthStore.setState({ isAuthenticated: true })
      api.get = vi.fn().mockResolvedValue({
        data: { success: true, data: { balance: 5 } }
      })

      act(() => {
        useAuthStore.getState().startPolling()
      })

      expect(api.get).toHaveBeenCalledTimes(1)

      act(() => {
        useAuthStore.getState().stopPolling()
      })

      // Advance timer by 3 seconds
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      // Should not have called again after stopping
      expect(api.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('bootstrap', () => {
    it('should restore session from localStorage token', async () => {
      const mockToken = 'test-token-123'
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      
      localStorage.setItem('access_token', mockToken)
      insforge.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      api.get = vi.fn().mockResolvedValue({
        data: { success: true, data: { balance: 10 } }
      })

      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })

      expect(insforge.auth.getUser).toHaveBeenCalled()
      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().loading).toBe(false)
      expect(useAuthStore.getState().tokenBalance).toBe(10)
    })

    it('should clear state if no token in localStorage', async () => {
      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('should clear state and token if getUser fails', async () => {
      const mockToken = 'test-token-123'
      localStorage.setItem('access_token', mockToken)
      
      insforge.auth.getUser = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Invalid token')
      })

      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })

      expect(localStorage.getItem('access_token')).toBeNull()
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('should clear state if getUser returns no user', async () => {
      const mockToken = 'test-token-123'
      localStorage.setItem('access_token', mockToken)
      
      insforge.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: null
      })

      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })

      expect(localStorage.getItem('access_token')).toBeNull()
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('setTokenBalance', () => {
    it('should update token balance', () => {
      const newBalance = 15

      act(() => {
        useAuthStore.getState().setTokenBalance(newBalance)
      })

      expect(useAuthStore.getState().tokenBalance).toBe(newBalance)
    })
  })
})
