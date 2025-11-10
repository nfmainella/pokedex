import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePokemonDetail } from './usePokemonDetail';
import { pokemonHttpClient } from '@/lib/httpClient';
import type { PokemonDetailResponse } from '@/lib/types';
import React from 'react';

// Mock the pokemonHttpClient
jest.mock('@/lib/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
  pokemonHttpClient: {
    get: jest.fn(),
  },
}));

const mockPokemonHttpClient = pokemonHttpClient as jest.Mocked<typeof pokemonHttpClient>;

// Create a wrapper for React Query
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

const mockPokemonDetail: PokemonDetailResponse = {
  id: 1,
  name: 'Bulbasaur',
  types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
  height: 7,
  weight: 69,
  stats: [
    { stat: { name: 'hp' }, base_stat: 45 },
    { stat: { name: 'attack' }, base_stat: 49 },
  ],
  abilities: [{ ability: { name: 'overgrow' }, is_hidden: false }],
  sprites: {
    other: {
      'official-artwork': {
        front_default:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/other/official-artwork/1.png',
      },
    },
  },
};

describe('usePokemonDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with valid Pokemon ID', () => {
    it('should fetch Pokemon detail by ID', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonDetail,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(() => usePokemonDetail(1), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockPokemonDetail);
      expect(result.current.isError).toBe(false);
      expect(mockPokemonHttpClient.get).toHaveBeenCalledWith('/1');
    });

    it('should fetch Pokemon detail by name', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonDetail,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result } = renderHook(() => usePokemonDetail('bulbasaur'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockPokemonDetail);
      expect(mockPokemonHttpClient.get).toHaveBeenCalledWith('/bulbasaur');
    });

    it('should cache data with 5 minute stale time', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonDetail,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      const { result, rerender } = renderHook(() => usePokemonDetail(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear the mock to verify it's not called again
      mockPokemonHttpClient.get.mockClear();

      // Rerender with same ID
      rerender();

      // Data should still be available from cache
      expect(result.current.data).toEqual(mockPokemonDetail);

      // Wait to ensure no additional requests
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not have made another request
      expect(mockPokemonHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('with null or undefined ID', () => {
    it('should not fetch when ID is null', async () => {
      const { result } = renderHook(() => usePokemonDetail(null), {
        wrapper: createWrapper(),
      });

      // Should not be loading or fetching when ID is null
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();

      // Wait a bit to ensure no requests are made
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockPokemonHttpClient.get).not.toHaveBeenCalled();
    });

    it('should not fetch when ID is undefined', async () => {
      const { result } = renderHook(() => usePokemonDetail(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockPokemonHttpClient.get).not.toHaveBeenCalled();
    });

    it('should disable query when ID is null', async () => {
      const { result, rerender } = renderHook(
        ({ id }) => usePokemonDetail(id),
        {
          wrapper: createWrapper(),
          initialProps: { id: null },
        }
      );

      expect(result.current.isLoading).toBe(false);

      // Now provide an ID
      rerender({ id: 1 });

      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonDetail,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockPokemonDetail);
      expect(mockPokemonHttpClient.get).toHaveBeenCalledWith('/1');
    });
  });

  describe('error handling', () => {
    it('should handle 404 not found error', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: 'Pokemon not found' },
        },
      };

      mockPokemonHttpClient.get.mockRejectedValue(error);

      const { result } = renderHook(() => usePokemonDetail(9999), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle 401 unauthorized error', async () => {
      const error = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      };

      mockPokemonHttpClient.get.mockRejectedValue(error);

      const { result } = renderHook(() => usePokemonDetail(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
    });

    it('should handle network errors', async () => {
      mockPokemonHttpClient.get.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePokemonDetail(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
    });
  });

  describe('query key behavior', () => {
    it('should use different query keys for different IDs', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonDetail,
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

      const QueryWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result: result1 } = renderHook(() => usePokemonDetail(1), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      mockPokemonHttpClient.get.mockClear();

      const { result: result2 } = renderHook(() => usePokemonDetail(2), {
        wrapper: QueryWrapper,
      });

      // Second query should trigger a new fetch
      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false);
      });

      // Both queries should have data
      expect(result1.current.data).toEqual(mockPokemonDetail);
      expect(result2.current.data).toEqual(mockPokemonDetail);

      // Should have made two requests (one for each ID)
      expect(mockPokemonHttpClient.get).toHaveBeenCalledTimes(1);
      expect(mockPokemonHttpClient.get).toHaveBeenCalledWith('/2');
    });

    it('should use different query keys for number vs string ID', async () => {
      mockPokemonHttpClient.get.mockResolvedValue({
        data: mockPokemonDetail,
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

      const QueryWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result: resultNumeric } = renderHook(() => usePokemonDetail(1), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(resultNumeric.current.isLoading).toBe(false);
      });

      const { result: resultString } = renderHook(() => usePokemonDetail('bulbasaur'), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(resultString.current.isLoading).toBe(false);
      });

      // Should have made two requests (different query keys)
      expect(mockPokemonHttpClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('no retry behavior', () => {
    it('should not retry on failure', async () => {
      mockPokemonHttpClient.get.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePokemonDetail(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Wait to ensure no retries
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockPokemonHttpClient.get).toHaveBeenCalledTimes(1);
    });
  });
});
