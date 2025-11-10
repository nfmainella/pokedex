import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useAuthStatus } from './useAuthStatus';
import React from 'react';

// Setup MSW server
const server = setupServer();

// Create a wrapper component for React Query
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
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should return isAuthenticated: true when the mocked /api/auth/status endpoint returns 200', async () => {
    server.use(
      http.get('/api/auth/status', () => {
        return HttpResponse.json({
          success: true,
          user: {
            username: 'admin',
          },
        });
      })
    );

    const { result } = renderHook(() => useAuthStatus(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isReady).toBe(false);

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    // After successful response
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isReady).toBe(true);
    expect(result.current.user).toEqual({ username: 'admin' });
  });

  it('should return isAuthenticated: false when the mocked /api/auth/status endpoint returns 401', async () => {
    server.use(
      http.get('/api/auth/status', () => {
        return HttpResponse.json(
          {
            error: 'Unauthorized: No token provided',
          },
          { status: 401 }
        );
      })
    );

    const { result } = renderHook(() => useAuthStatus(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);

    // Wait for the query to complete (or fail)
    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    // After 401 response
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isReady).toBe(true);
    expect(result.current.user).toBeUndefined();
  });
});

