import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLoginMutation, useLogoutMutation } from './useLoginMutation';
import { httpClient } from '@/lib/httpClient';
import React from 'react';

// Mock the httpClient
jest.mock('@/lib/httpClient', () => ({
  httpClient: {
    post: jest.fn(),
  },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
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

describe('useLoginMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login mutation', () => {
    it('should successfully login with valid credentials', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: {
          success: true,
          user: { username: 'testuser' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(() => useLoginMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        username: 'testuser',
        password: 'password123',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        success: true,
        user: { username: 'testuser' },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/login', {
        username: 'testuser',
        password: 'password123',
      });
    });

    it('should return error on invalid credentials', async () => {
      const error = {
        response: {
          status: 401,
          data: { error: 'Invalid credentials' },
        },
      };

      mockHttpClient.post.mockRejectedValue(error);

      const { result } = renderHook(() => useLoginMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        username: 'testuser',
        password: 'wrongpassword',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.isSuccess).toBe(false);
    });

    it('should handle network errors', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLoginMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        username: 'testuser',
        password: 'password123',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should invalidate userStatus query on success', async () => {
      const queryClient = new QueryClient();
      let queryInvalidated = false;

      // Spy on invalidateQueries
      const originalInvalidate = queryClient.invalidateQueries.bind(queryClient);
      queryClient.invalidateQueries = jest.fn(async (options) => {
        if (JSON.stringify(options).includes('userStatus')) {
          queryInvalidated = true;
        }
        return originalInvalidate(options);
      });

      mockHttpClient.post.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const QueryWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useLoginMutation(), {
        wrapper: QueryWrapper,
      });

      result.current.mutate({
        username: 'testuser',
        password: 'password123',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['userStatus'],
      });
    });

    it('should provide mutation status flags', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(() => useLoginMutation(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);

      result.current.mutate({
        username: 'testuser',
        password: 'password123',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
    });
  });
});

describe('useLogoutMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logout mutation', () => {
    it('should successfully logout', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(() => useLogoutMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/logout');
    });

    it('should handle logout errors gracefully', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useLogoutMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should set userStatus to false on success', async () => {
      const queryClient = new QueryClient();
      let setQueryDataCalled = false;

      // Spy on setQueryData
      const originalSetQueryData = queryClient.setQueryData.bind(queryClient);
      queryClient.setQueryData = jest.fn((key, data) => {
        if (JSON.stringify(key).includes('userStatus')) {
          setQueryDataCalled = true;
          expect(data).toEqual({ success: false });
        }
        return originalSetQueryData(key, data);
      });

      mockHttpClient.post.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const QueryWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useLogoutMutation(), {
        wrapper: QueryWrapper,
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(queryClient.setQueryData).toHaveBeenCalledWith(['userStatus'], { success: false });
    });

    it('should remove pokemon queries on success', async () => {
      const queryClient = new QueryClient();
      const removeQueries = jest.spyOn(queryClient, 'removeQueries');

      mockHttpClient.post.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const QueryWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useLogoutMutation(), {
        wrapper: QueryWrapper,
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(removeQueries).toHaveBeenCalledWith({ queryKey: ['pokemonList'] });
      expect(removeQueries).toHaveBeenCalledWith({ queryKey: ['pokemon'] });
    });

    it('should provide mutation status flags', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(() => useLogoutMutation(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
    });

    it('should prevent refetch after logout by clearing query data', async () => {
      const queryClient = new QueryClient();

      mockHttpClient.post.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const QueryWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useLogoutMutation(), {
        wrapper: QueryWrapper,
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify userStatus query data is cleared
      const userStatusData = queryClient.getQueryData(['userStatus']);
      expect(userStatusData).toEqual({ success: false });
    });
  });
});
