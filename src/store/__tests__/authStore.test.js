import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import useAuthStore from '../authStore'
import api from '../../services/api'
import { authClient } from '../../lib/authClient'

// Mock dependencies
vi.mock('../../services/api')
vi.mock('../../lib/authClient')

describe('authStore', () => {
  beforeEach(() => {
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
      api.get.mockResolvedValue({
        data: { success: true, data: { balance: 150 } },
      })

      await act(async () => {
        await useAuthStore.getState().fetchTokenBalance()
      })

      expect(useAuthStore.getState().tokenBalance).toBe(150)
    })

    it('should handle API error gracefully', async () => {
      api.get.mockRejectedValue(new Error('Network error'))

      await act(async () => {
        await useAuthStore.getState().fetchTokenBalance()
      })

      expect(useAuthStore.getState().tokenBalance).toBeNull()
    })

    it('should not set balance if response is not successful', async () => {
      api.get.mockResolvedValue({
        data: { success: false, error: 'Error' },
      })

      await act(async () => {
        await useAuthStore.getState().fetchTokenBalance()
      })

      expect(useAuthStore.getState().tokenBalance).toBeNull()
    })
  })

  describe('bootstrap', () => {
    it('should set loading false when no session', async () => {
      authClient.getSession.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })

      expect(useAuthStore.getState().loading).toBe(false)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('should set loading false on error', async () => {
      authClient.getSession.mockRejectedValue(new Error('Network error'))

      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })

      expect(useAuthStore.getState().loading).toBe(false)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('should authenticate user with valid session', async () => {
      const mockUser = { id: 'user-1', email: 'test@test.com', name: 'Test', image: 'https://example.com/avatar.jpg' }
      const mockSession = { id: 'session-1' }

      authClient.getSession.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      api.get.mockResolvedValue({
        data: { success: true, data: { balance: 5 } },
      })

      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })

      const state = useAuthStore.getState()
      expect(state.loading).toBe(false)
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        avatar_url: 'https://example.com/avatar.jpg',
      })
      expect(state.tokenBalance).toBe(5)
    })
  })

  describe('setTokenBalance', () => {
    it('should update token balance', () => {
      act(() => {
        useAuthStore.getState().setTokenBalance(100)
      })

      expect(useAuthStore.getState().tokenBalance).toBe(100)
    })
  })
})
