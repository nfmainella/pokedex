import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStatus } from './useAuthStatus';
import { httpClient } from '@/lib/httpClient';
import type { AxiosError } from 'axios';
import React from 'react';

// Mock the httpClient
jest.mock('@/lib/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const QueryWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  QueryWrapper.displayName = 'QueryWrapper';

  return QueryWrapper;
};

describe('useAuthStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when authenticated', () => {
    it('should return authenticated state with user data', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          success: true,
          user: { username: 'testuser' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(() => useAuthStatus(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isReady).toBe(true);
      expect(result.current.user).toEqual({ username: 'testuser' });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/status');
    });
  });

  describe('when not authenticated (401)', () => {
    it('should return unauthenticated state for 401 response', async () => {
      const error: AxiosError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      } as never;

      mockHttpClient.get.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isReady).toBe(true);
      expect(result.current.user).toBeUndefined();
    });
  });

  describe('when not authenticated (403)', () => {
    it('should return unauthenticated state for 403 response', async () => {
      const error: AxiosError = {
        response: {
          status: 403,
          data: { error: 'Forbidden' },
        },
      } as never;

      mockHttpClient.get.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isReady).toBe(true);
    });
  });

  describe('when server error occurs', () => {
    it('should set error state for 500 response', async () => {
      const error: AxiosError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      } as never;

      mockHttpClient.get.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isReady).toBe(false);
    });

    it('should set error state for network error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isReady).toBe(false);
    });
  });

  describe('refetch behavior', () => {
    it('should refetch on mount', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          success: true,
          user: { username: 'testuser' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { rerender } = renderHook(() => useAuthStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      });

      // Rerender - should trigger refetchOnMount
      rerender();

      await waitFor(() => {
        expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
      });
    });

    it('should not refetch on window focus', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          success: true,
          user: { username: 'testuser' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(() => useAuthStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);

      // Simulate window focus
      window.dispatchEvent(new Event('focus'));

      // Wait a bit and verify no additional calls
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('isReady state', () => {
    it('should be true when loading is false and no error', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          success: true,
          user: { username: 'testuser' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(() => useAuthStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
    });

    it('should be false when there is an error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(false);
      });
    });
  });

  describe('no retry behavior', () => {
    it('should not retry on failure', async () => {
      const error: AxiosError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      } as never;

      mockHttpClient.get.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Wait a bit to ensure no retries
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    });
  });
});
