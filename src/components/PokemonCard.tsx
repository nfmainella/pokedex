'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import type { FormattedPokemonListItem } from '@/lib/types';

/**
 * Props interface for PokemonCard component
 */
export interface PokemonCardProps {
  pokemon: FormattedPokemonListItem;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const queryClient = useQueryClient();

  /**
   * Prefetch the Pokémon detail data when hovering over the card
   * This minimizes perceived latency when the user navigates to the details page
   */
  const handleMouseEnter = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['pokemon', pokemon.id],
      queryFn: async () => {
        const response = await fetch(`/api/pokemon/${pokemon.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch Pokémon detail: ${response.statusText}`);
        }
        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient, pokemon.id]);

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="relative block bg-white rounded-lg shadow-outer-active isolate hover:shadow-card-hover transition-shadow w-full aspect-[1/1.25]"
      onMouseEnter={handleMouseEnter}
    >
      {/* Number Section - Top */}
      <div className="flex flex-row justify-end items-start pt-1.5 sm:pt-2 px-2 sm:px-3 gap-2 w-full flex-none z-0">
        <span className="text-xs sm:text-sm leading-4 sm:leading-5 text-text-muted text-right">
          {pokemon.displayId}
        </span>
      </div>

      {/* Name Section - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-row items-center justify-center pt-4 sm:pt-5 px-2 sm:px-3 pb-1.5 sm:pb-2 w-full bg-background-light rounded-b-lg z-10">
        <span className="text-xs sm:text-sm leading-4 sm:leading-5 text-text-dark text-center line-clamp-2 font-medium">
          {pokemon.name}
        </span>
      </div>

      {/* Pokémon Image - Centered, Overlapping */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 z-20 flex items-center justify-center aspect-square">
        <Image
          src={pokemon.imageUrl}
          alt={pokemon.name}
          width={128}
          height={128}
          className="object-contain w-full h-full"
        />
      </div>
    </Link>
  );
}

