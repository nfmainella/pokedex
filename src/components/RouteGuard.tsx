'use client';

import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isReady } = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isReady) return;

    const isProtectedRoute = pathname === '/';
    const isPublicRoute = pathname === '/login';

    if (!isAuthenticated && isProtectedRoute) {
      router.replace('/login');
    } else if (isAuthenticated && isPublicRoute) {
      router.replace('/');
    }
  }, [isAuthenticated, isReady, pathname, router]);

  if (!isReady || (isLoading && pathname === '/')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

