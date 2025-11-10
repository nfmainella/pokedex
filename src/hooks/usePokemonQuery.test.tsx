import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePokemonQuery } from './usePokemonQuery';
import type { PokemonListResponse } from '@/lib/types';
import { httpClient } from '@/lib/httpClient';
import React from 'react';

// Mock the pokemonHttpClient
jest.mock('@/lib/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

const mockPokemonHttpClient = httpClient as jest.Mocked<typeof httpClient>;

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

describe('usePokemonQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPokemonResponse: PokemonListResponse = {
    count: 1302,
    next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
    previous: null,
    results: [
      { id: 1, name: 'Bulbasaur', displayId: '#001', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/other/official-artwork/1.png' },
      { id: 2, name: 'Ivysaur', displayId: '#002', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/other/official-artwork/2.png' },
      { id: 3, name: 'Venusaur', displayId: '#003', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/other/official-artwork/3.png' },
      { id: 4, name: 'Charmander', displayId: '#004', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/other/official-artwork/4.png' },
      { id: 6, name: 'Charizard', displayId: '#006', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/other/official-artwork/6.png' },
    ],
  };

  describe('Successful queries', () => {
    it('should fetch Pokémon list with default parameters', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(() => usePokemonQuery(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for the query to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the API was called with correct parameters
      expect(mockPokemonHttpClient.get).toHaveBeenCalledWith('?limit=20&offset=0&sortBy=id&sortDir=asc');

      // After successful response
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toEqual(mockPokemonResponse);
    });

    it('should fetch Pokémon list with custom parameters', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(
        () =>
          usePokemonQuery({
            limit: 10,
            offset: 20,
            search: 'pikachu',
            sortBy: 'name',
          }),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the API was called with correct parameters
      expect(mockPokemonHttpClient.get).toHaveBeenCalledWith(
        '?limit=10&offset=20&search=pikachu&sortBy=name&sortDir=asc'
      );

      expect(result.current.data).toEqual(mockPokemonResponse);
    });

    it('should use correct query key based on parameters', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result, rerender } = renderHook(
        ({ params }) => usePokemonQuery(params),
        {
          wrapper: createWrapper(),
          initialProps: { params: { limit: 20, offset: 0 } },
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Change parameters - should trigger a new query
      rerender({ params: { limit: 20, offset: 20 } });

      // Should be loading again with new parameters
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have made 2 calls
      expect(mockPokemonHttpClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Parameter handling', () => {
    it('should handle empty search string', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(
        () => usePokemonQuery({ search: '' }),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Empty search should not be included in query params
      expect(mockPokemonHttpClient.get).toHaveBeenCalledWith('?limit=20&offset=0&sortBy=id&sortDir=asc');
      expect(result.current.data).toEqual(mockPokemonResponse);
    });

    it('should handle undefined parameters by using defaults', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(
        () => usePokemonQuery({ limit: undefined, offset: undefined }),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should use default values
      expect(mockPokemonHttpClient.get).toHaveBeenCalledWith('?limit=20&offset=0&sortBy=id&sortDir=asc');
      expect(result.current.data).toEqual(mockPokemonResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle 401 unauthorized errors', async () => {
      const error = {
        response: {
          status: 401,
          data: { error: 'Unauthorized: No token provided' },
        },
      };
      mockPokemonHttpClient.get.mockRejectedValue(error);

      const { result } = renderHook(() => usePokemonQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle 500 server errors', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      };
      mockPokemonHttpClient.get.mockRejectedValue(error);

      const { result } = renderHook(() => usePokemonQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle network errors', async () => {
      mockPokemonHttpClient.get.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePokemonQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should not retry on failure (retry: 0)', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Server error' },
        },
      };
      mockPokemonHttpClient.get.mockRejectedValue(error);

      const { result } = renderHook(() => usePokemonQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Wait a bit to ensure no retries happen
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should only make one request (no retries)
      expect(mockPokemonHttpClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Caching and staleTime', () => {
    it('should cache data and not refetch immediately', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result, rerender } = renderHook(
        () => usePokemonQuery({ limit: 20, offset: 0 }),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockPokemonHttpClient.get).toHaveBeenCalledTimes(1);

      // Rerender with same parameters - should use cache
      rerender();

      // Should still have data without making another request
      expect(result.current.data).toEqual(mockPokemonResponse);
      // Wait a bit to ensure no additional requests
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockPokemonHttpClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Query key generation', () => {
    it('should generate different query keys for different parameters', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });

      const { result: result1 } = renderHook(
        () => usePokemonQuery({ limit: 20, offset: 0, sortBy: 'id' }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      );

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      const { result: result2 } = renderHook(
        () => usePokemonQuery({ limit: 20, offset: 0, sortBy: 'name' }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      );

      // Should trigger a new query because sortBy changed
      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false);
      });

      // Both should have data (different cache entries)
      expect(result1.current.data).toEqual(mockPokemonResponse);
      expect(result2.current.data).toEqual(mockPokemonResponse);
    });
  });

  describe('isFetching state', () => {
    it('should set isFetching to true during background refetch', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(() => usePokemonQuery(), {
        wrapper: createWrapper(),
      });

      // Initially fetching
      expect(result.current.isFetching).toBe(true);

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      // After completion, should not be fetching
      expect(result.current.isFetching).toBe(false);
    });
  });
});
