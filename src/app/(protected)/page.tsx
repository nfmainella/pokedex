'use client';

import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useLogoutMutation } from '@/hooks/useLoginMutation';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const logoutMutation = useLogoutMutation();
  const { user } = useAuthStatus();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            Welcome, {user?.username || 'User'}!
          </h1>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h2 className="max-w-xs text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Protected Page
          </h2>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            This is a protected route. You are successfully authenticated!
          </p>
        </div>
      </main>
    </div>
  );
}

