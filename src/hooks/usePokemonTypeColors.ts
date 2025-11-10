import { useMemo } from 'react';
import { getPrimaryTypeColor, getTypeColors } from '@/lib/pokemonTypes';
import type { PokemonType as ApiPokemonType } from '@/lib/types';

/**
 * Interface for Pokémon data with types (accepts PokeAPI response format)
 */
export interface PokemonWithTypes {
  types: ApiPokemonType[];
}

/**
 * Hook to get type colors for a Pokémon
 * 
 * @param pokemon - Pokémon data with types array
 * @returns Object with primary color and array of all type colors
 * 
 * @example
 * ```tsx
 * const { primaryColor, typeColors } = usePokemonTypeColors(pokemon);
 * <div style={{ backgroundColor: primaryColor }}>
 *   {pokemon.types.map((type, i) => (
 *     <span key={i} style={{ backgroundColor: typeColors[i] }}>
 *       {type.name}
 *     </span>
 *   ))}
 * </div>
 * ```
 */
export function usePokemonTypeColors(pokemon: PokemonWithTypes | null | undefined) {
  return useMemo(() => {
    if (!pokemon || !pokemon.types || pokemon.types.length === 0) {
      return {
        primaryColor: '#666666',
        typeColors: ['#666666'],
        typeNames: [] as string[],
      };
    }

    // Extract type names from the nested structure
    const typeNames = pokemon.types.map(t => t.type.name);
    const primaryColor = getPrimaryTypeColor(typeNames);
    const typeColors = getTypeColors(typeNames);

    return {
      primaryColor,
      typeColors,
      typeNames,
    };
  }, [pokemon]);
}

