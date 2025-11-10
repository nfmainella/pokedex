/**
 * Shared type definitions for Pokémon API responses
 * Used across both frontend and backend
 */

/**
 * Basic Pokémon list item from PokeAPI
 */
export interface PokemonListItem {
  name: string;
  url: string;
}

/**
 * Paginated Pokémon list response
 */
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

/**
 * Pokémon type information
 */
export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

/**
 * Pokémon base stat information
 */
export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

/**
 * Pokémon ability information
 */
export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

/**
 * Complete Pokémon detail response
 */
export interface PokemonDetailResponse {
  id: number;
  name: string;
  height: number; // in decimeters
  weight: number; // in hectograms
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  sprites: {
    front_default: string;
    other?: {
      'official-artwork'?: {
        front_default: string;
      };
    };
  };
  species: {
    name: string;
    url: string;
  };
}

/**
 * Query parameters for list endpoint
 */
export interface PokemonQueryParams {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'name' | 'id';
  sortDir?: 'asc' | 'desc';
}
