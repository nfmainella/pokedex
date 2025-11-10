'use client';

import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/lib/httpClient';
import type { AxiosError } from 'axios';

interface UserStatusResponse {
  success: boolean;
  user?: {
    username: string;
  };
}

export const useAuthStatus = () => {
  const { data, isLoading, error } = useQuery<UserStatusResponse>({
    queryKey: ['userStatus'],
    queryFn: async () => {
      try {
        const response = await httpClient.get<UserStatusResponse>('/status');
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        // Handle 401/403 as "not authenticated" rather than an error
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          return { success: false };
        }
        // Re-throw other errors
        throw err;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });

  return {
    isAuthenticated: !!data?.success,
    isLoading,
    isReady: !isLoading && !error,
    user: data?.user,
  };
};

