'use client';

import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * RouteGuard handles client-side navigation and login page redirects.
 * Server-side protection (requireAuth) handles initial page loads and refreshes.
 * 
 * This component:
 * - Redirects authenticated users away from /login
 * - Handles client-side navigation to protected routes
 * - Provides loading states during auth checks
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isReady } = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isReady) return;

    const isPublicRoute = pathname === '/login';
    const isProtectedRoute = pathname === '/';

    // Redirect authenticated users away from login page
    if (isAuthenticated && isPublicRoute) {
      router.replace('/');
      return;
    }

    // Handle client-side navigation to protected routes
    // (Server-side requireAuth handles initial loads, but not client-side nav)
    if (!isAuthenticated && isProtectedRoute) {
      router.replace('/login');
    }
  }, [isAuthenticated, isReady, pathname, router]);

  // Show loading state while checking auth
  if (!isReady || (isLoading && pathname === '/')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

