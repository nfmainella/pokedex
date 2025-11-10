'use client';

import { useQuery } from '@tanstack/react-query';
import { pokemonHttpClient } from '@/lib/httpClient';
import { PokemonDetailResponse } from '@/lib/types';

/**
 * Fetches detailed information about a specific Pokémon
 * @param id - Pokémon ID (number) or name (string)
 * @returns Promise resolving to Pokémon detail data
 */
async function fetchPokemonDetail(id: number | string): Promise<PokemonDetailResponse> {
  const response = await pokemonHttpClient.get<PokemonDetailResponse>(`/${id}`);
  return response.data;
}

/**
 * React Query hook to fetch Pokémon details
 * 
 * @param id - Pokémon ID (number) or name (string)
 * @returns Query result with Pokémon detail data
 * 
 * @example
 * ```tsx
 * const { data: pokemon, isLoading, isError } = usePokemonDetail(1);
 * 
 * if (isLoading) return <div>Loading...</div>;
 * if (isError) return <div>Error loading Pokémon</div>;
 * 
 * return <div>{pokemon.name}</div>;
 * ```
 */
export function usePokemonDetail(id: number | string | null | undefined) {
  return useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => fetchPokemonDetail(id!),
    enabled: id !== null && id !== undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

