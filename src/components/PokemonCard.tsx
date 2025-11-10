'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * Type definition for a Pokémon type
 */
interface PokemonType {
  name: string;
}

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
    types: PokemonType[];
  };
}

/**
 * Map of Pokémon type names to their corresponding hex colors
 * Based on the design system and Pokémon type color palette
 */
const typeColors: Record<string, string> = {
  normal: '#AA9999',
  fighting: '#CC4444',
  flying: '#9BB4E8',
  ground: '#D4A574',
  poison: '#A552CC',
  rock: '#BBAA66',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#B8B8D0',
  fire: '#FF6600',
  water: '#3399FF',
  grass: '#8DD694',
  electric: '#FFCC33',
  psychic: '#F85888',
  ice: '#66CCCC',
  dragon: '#7038F8',
  dark: '#705848',
  fairy: '#EE99AC',
};

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
 * - Pokémon ID/number
 * - Pokémon name
 * - Pokémon image
 * - Type badges with appropriate colors
 * 
 * The card is wrapped in a Next.js Link component for navigation to the detail view.
 */
export function PokemonCard({ pokemon }: PokemonCardProps) {
  const formattedId = formatPokemonId(pokemon.id);
  const capitalizedName = capitalize(pokemon.name);

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="group relative block bg-white rounded-xl shadow-card-sm transition-all duration-200 hover:scale-105 hover:shadow-card-lg"
    >
      <div className="p-4 flex flex-col items-center gap-3">
        {/* ID/Number */}
        <div className="w-full flex justify-end">
          <span className="text-sm font-bold text-gray-600">
            {formattedId}
          </span>
        </div>

        {/* Pokémon Image */}
        <div className="flex items-center justify-center">
          <Image
            src={pokemon.sprites.front_default}
            alt={capitalizedName}
            width={96}
            height={96}
            className="object-contain"
          />
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900">
          {capitalizedName}
        </h3>

        {/* Type Badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          {pokemon.types.map((type) => {
            const typeName = type.name.toLowerCase();
            const backgroundColor = typeColors[typeName] || typeColors.normal;
            
            return (
              <span
                key={type.name}
                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor }}
              >
                {capitalize(type.name)}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

