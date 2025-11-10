/**
 * Shared type definitions for Pokémon API responses
 * Used across both frontend and backend
 */

/**
 * Basic Pokémon list item from PokeAPI (internal use only)
 */
export interface PokemonListItem {
  name: string;
  url: string;
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
 * Query parameters for list endpoint
 */
export interface PokemonQueryParams {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'name' | 'id';
  sortDir?: 'asc' | 'desc';
}

/**
 * Formatted stat for display (already ordered and mapped)
 */
export interface FormattedStat {
  name: string; // e.g. "HP", "ATK", "DEF"
  value: number;
  displayValue: string; // Zero-padded (e.g., "045")
}

/**
 * Formatted Pokemon list item for display
 */
export interface FormattedPokemonListItem {
  id: number;
  name: string; // Capitalized (e.g., "Pikachu")
  displayId: string; // Formatted with padding (e.g., "#001")
  imageUrl: string; // Full sprite URL
}

/**
 * Formatted Pokemon list response - This replaces the raw PokemonListResponse
 * All items are pre-formatted for display
 */
export interface FormattedPokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FormattedPokemonListItem[];
}

/**
 * Formatted Pokemon detail response - This replaces the raw PokemonDetailResponse
 * All fields are pre-formatted for display
 */
export interface FormattedPokemonDetailResponse {
  id: number;
  displayId: string; // Formatted with padding (e.g., "#001")
  name: string; // Capitalized (e.g., "Pikachu")
  height: string; // Formatted (e.g., "0.4 m")
  weight: string; // Formatted (e.g., "6.0 kg")
  types: Array<{
    name: string; // Capitalized (e.g., "Electric")
    color: string; // Hex color code
  }>;
  stats: FormattedStat[]; // Already ordered: hp, attack, defense, special-attack, special-defense, speed
  abilities: string[]; // Capitalized with spaces (e.g., "Static Electricity"), non-hidden only
  imageUrl: string; // Preferred official artwork URL
  description?: string;
}

/**
 * Type aliases for backward compatibility with hooks
 * These now point to the formatted responses since that's what the API returns
 */
export type PokemonListResponse = FormattedPokemonListResponse;
export type PokemonDetailResponse = FormattedPokemonDetailResponse;
