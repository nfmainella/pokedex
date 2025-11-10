'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/lib/httpClient';

interface LoginCredentials {
  username: string;
  password: string;
}

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await httpClient.post('/login', credentials);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStatus'] });
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await httpClient.post('/logout');
      return response.data;
    },
    onSuccess: () => {
      // Set the query data directly to indicate not authenticated
      // This prevents a refetch that would fail with 401
      queryClient.setQueryData(['userStatus'], { success: false });

      // Clear all Pokemon-related queries to ensure fresh data after login
      queryClient.removeQueries({ queryKey: ['pokemonList'] });
      queryClient.removeQueries({ queryKey: ['pokemon'] });
    },
  });
};

