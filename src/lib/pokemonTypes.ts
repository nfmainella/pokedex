/**
 * Pokémon Type Color Mapping
 * 
 * Maps Pokémon types to their corresponding colors based on the design specifications.
 * These colors are used for:
 * - Header backgrounds
 * - Type chips
 * - Section titles ("About", "Base Stats")
 * - Stat bar fills
 * - Stat labels
 */

/**
 * Pokémon Type Color Mapping
 * Colors extracted from the design specifications (Figma CSS)
 */
export const POKEMON_TYPE_COLORS: Record<string, string> = {
  normal: '#AAA67F',
  fighting: '#C12239',
  flying: '#A891EC',
  poison: '#A43E9E',
  ground: '#DEC16B',
  rock: '#B69E31',
  bug: '#A7B723',
  ghost: '#70559B',
  steel: '#B7B9D0',
  fire: '#F57D31',
  water: '#6493EB',
  grass: '#74CB48',
  electric: '#F9CF30',
  psychic: '#FB5584',
  ice: '#9AD6DF',
  dragon: '#7037FF',
  dark: '#75574C',
  fairy: '#E69EAC',
};

/**
 * Gets the color for a given Pokémon type
 * @param type - The Pokémon type name (case-insensitive)
 * @returns The hex color code for the type, or a default gray if type not found
 */
export function getTypeColor(type: string): string {
  const normalizedType = type.toLowerCase();
  return POKEMON_TYPE_COLORS[normalizedType] || '#666666';
}

/**
 * Gets the primary type color (for header background, main accents)
 * Uses the first type if multiple types are provided
 * @param types - Array of Pokémon type names
 * @returns The hex color code for the primary type
 */
export function getPrimaryTypeColor(types: string[]): string {
  if (!types || types.length === 0) {
    return '#666666';
  }
  return getTypeColor(types[0]);
}

/**
 * Gets colors for all types of a Pokémon
 * @param types - Array of Pokémon type names
 * @returns Array of hex color codes corresponding to each type
 */
export function getTypeColors(types: string[]): string[] {
  if (!types || types.length === 0) {
    return ['#666666'];
  }
  return types.map(type => getTypeColor(type));
}

