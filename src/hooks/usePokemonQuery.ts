'use client';

import { useQuery } from '@tanstack/react-query';
import { pokemonHttpClient } from '@/lib/httpClient';

/**
 * Parameters for the usePokemonQuery hook
 */
export interface UsePokemonQueryParams {
  /** Number of items per page (Pagination) */
  limit?: number;
  /** Starting point in the list (Pagination) */
  offset?: number;
  /** Used for filtering Pokémon by name */
  search?: string;
  /** Used for sorting the results */
  sortBy?: 'name' | 'id';
}

/**
 * Response structure from the Pokémon API endpoint
 */
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Custom hook for fetching paginated and sorted list of Pokémon
 * 
 * Uses TanStack Query to manage data fetching, caching, and state.
 * Automatically includes authentication cookies via httpClient configuration.
 * 
 * @param params - Query parameters for pagination, search, and sorting
 * @returns Standard useQuery object with data, isLoading, isError, isFetching, etc.
 * 
 * @example
 * ```tsx
 * const { data, isLoading, isError } = usePokemonQuery({
 *   limit: 20,
 *   offset: 0,
 *   search: 'pikachu',
 *   sortBy: 'name'
 * });
 * ```
 */
export function usePokemonQuery(params: UsePokemonQueryParams = {}) {
  const {
    limit = 20,
    offset = 0,
    search = '',
    sortBy = 'id',
  } = params;

  return useQuery<PokemonListResponse>({
    queryKey: ['pokemonList', { limit, offset, search, sortBy }],
    queryFn: async () => {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (limit !== undefined) {
        queryParams.set('limit', limit.toString());
      }
      if (offset !== undefined) {
        queryParams.set('offset', offset.toString());
      }
      if (search) {
        queryParams.set('search', search);
      }
      if (sortBy) {
        queryParams.set('sortBy', sortBy);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `?${queryString}` : '';

      // Use pokemonHttpClient which is configured with the same pattern as httpClient
      // (withCredentials: true) to automatically include auth cookies
      const response = await pokemonHttpClient.get<PokemonListResponse>(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0, // Don't retry on failure (especially for auth failures)
  });
}

