import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouteGuard } from './RouteGuard';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter, usePathname } from 'next/navigation';
import React from 'react';

// Mock next/navigation
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(),
}));

// Mock useAuthStatus
jest.mock('@/hooks/useAuthStatus');

const mockUseAuthStatus = useAuthStatus as jest.MockedFunction<
  typeof useAuthStatus
>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('RouteGuard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    mockReplace.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderRouteGuard = (children: React.ReactNode = <div>Test Content</div>) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <RouteGuard>{children}</RouteGuard>
      </QueryClientProvider>
    );
  };

  describe('Loading state', () => {
    it('should show loading when not ready', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isReady: false,
        user: undefined,
      });
      mockUsePathname.mockReturnValue('/');

      renderRouteGuard();

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show loading when on protected route and still loading', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isReady: true,
        user: undefined,
      });
      mockUsePathname.mockReturnValue('/');

      renderRouteGuard();

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Protected route (/)', () => {
    it('should redirect to login when not authenticated', async () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isReady: true,
        user: undefined,
      });
      mockUsePathname.mockReturnValue('/');

      renderRouteGuard();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/login');
      });
    });

    it('should render children when authenticated', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isReady: true,
        user: { username: 'admin' },
      });
      mockUsePathname.mockReturnValue('/');

      renderRouteGuard();

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('Public route (/login)', () => {
    it('should redirect to home when authenticated', async () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isReady: true,
        user: { username: 'admin' },
      });
      mockUsePathname.mockReturnValue('/login');

      renderRouteGuard();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/');
      });
    });

    it('should render children when not authenticated', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isReady: true,
        user: undefined,
      });
      mockUsePathname.mockReturnValue('/login');

      renderRouteGuard();

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('Other routes', () => {
    it('should render children without redirecting', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isReady: true,
        user: undefined,
      });
      mockUsePathname.mockReturnValue('/other');

      renderRouteGuard();

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});

