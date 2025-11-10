'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Type definition for Pokémon sprites
 */
interface PokemonSprites {
  front_default: string;
}

/**
 * Props interface for PokemonCard component
 */
export interface PokemonCardProps {
  pokemon: {
    name: string;
    id: number;
    sprites: PokemonSprites;
  };
}

/**
 * Formats the Pokémon ID as a zero-padded string (e.g., 1 -> "001")
 */
function formatPokemonId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

/**
 * Capitalizes the first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * PokemonCard Component
 *
 * A reusable client-side component that displays a Pokémon card with:
 * - Pokémon ID/number (top right)
 * - Pokémon name (bottom, on light gray background)
 * - Pokémon image (centered, overlapping number and name sections)
 *
 * Performance Optimization:
 * - Implements prefetch on hover: When the user hovers over a card, the component
 *   automatically prefetches the Pokémon detail data using TanStack Query's
 *   prefetchQuery method, minimizing perceived latency when navigating to details
 *
 * The card matches the design specifications:
 * - Fixed dimensions: 104px × 108px
 * - Number section: 8px font, right-aligned, #666666
 * - Name section: 10px font, centered, #1D1D1D on #EFEFEF background
 * - Image: 72px × 72px, absolutely positioned
 *
 * The card is wrapped in a Next.js Link component for navigation to the detail view.
 */
export function PokemonCard({ pokemon }: PokemonCardProps) {
  const formattedId = formatPokemonId(pokemon.id);
  const capitalizedName = capitalize(pokemon.name);
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
      className="relative block w-[104px] h-[108px] bg-white rounded-lg shadow-[0px_1px_3px_1px_rgba(0,0,0,0.2)] isolate hover:shadow-[0px_2px_6px_2px_rgba(0,0,0,0.3)] transition-shadow"
      onMouseEnter={handleMouseEnter}
    >
      {/* Number Section - Top */}
      <div className="flex flex-row justify-end items-start pt-1 px-2 gap-2 w-[104px] h-4 z-0">
        <span className="text-[8px] leading-3 text-[#666666] text-right">
          {formattedId}
        </span>
      </div>

      {/* Name Section - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-row items-start pt-6 px-2 pb-1 w-[104px] h-11 bg-[#EFEFEF] rounded-[7px] z-10">
        <span className="w-[88px] h-4 text-[10px] leading-4 text-[#1D1D1D] text-center">
          {capitalizedName}
        </span>
      </div>

      {/* Pokémon Image - Centered, Overlapping */}
      <div className="absolute left-4 top-4 w-[72px] h-[72px] z-20">
        <Image
          src={pokemon.sprites.front_default}
          alt={capitalizedName}
          width={72}
          height={72}
          className="object-contain"
        />
      </div>
    </Link>
  );
}

