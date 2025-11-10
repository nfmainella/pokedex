/**
 * Pokémon Service - Handles all PokeAPI interactions
 * Server-side service for API routes
 */

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_LIST_LIMIT = 1000; // Fetch first 1000 Pokemon

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

/**
 * Fetches the complete master list of Pokémon from PokeAPI
 * @returns The complete list of all Pokémon (up to 1000)
 */
const fetchMasterPokemonList = async (): Promise<PokemonListItem[]> => {
  const response = await fetch(
    `${POKEAPI_BASE_URL}/pokemon?limit=${POKEMON_LIST_LIMIT}&offset=0`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon list from PokeAPI: ${response.statusText}`);
  }

  const data = (await response.json()) as PokemonListResponse;
  return data.results;
};

/**
 * Fetches paginated and optionally sorted Pokémon list with formatting
 * Supports searching by name, sorting, and pagination on server-side
 * Returns fully formatted data for display
 */
export const fetchPokemonList = async (
  limit: number,
  offset: number,
  sortBy: 'id' | 'name' = 'id',
  sortDir: 'asc' | 'desc' = 'asc',
  search: string = ''
) => {
  try {
    // Get the master list from PokeAPI
    const masterList = await fetchMasterPokemonList();

    // Apply search filter if provided
    let filteredList = masterList;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filteredList = masterList.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    const sortedList = sortPokemonList(filteredList, sortBy, sortDir);

    // Apply pagination
    const paginatedResults = sortedList.slice(offset, offset + limit);

    // Calculate next and previous
    const next = offset + limit < sortedList.length ? offset + limit : null;
    const previous = offset > 0 ? Math.max(0, offset - limit) : null;

    // Build query string for pagination links
    const buildQueryString = (newOffset: number) => {
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      params.set('offset', newOffset.toString());
      params.set('sortBy', sortBy);
      params.set('sortDir', sortDir);
      if (search.trim()) {
        params.set('search', search);
      }
      return `?${params.toString()}`;
    };

    // Format the results for display
    const formattedResults = paginatedResults.map(pokemon => {
      const id = extractPokemonId(pokemon.url);
      return {
        id,
        name: capitalize(pokemon.name),
        displayId: formatPokemonId(id),
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      };
    });

    return {
      count: sortedList.length,
      next: next !== null ? buildQueryString(next) : null,
      previous: previous !== null ? buildQueryString(previous) : null,
      results: formattedResults,
    };
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
};

/**
 * Type color mapping for Pokemon types
 */
const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fighting: '#C03028',
  flying: '#A890F0',
  poison: '#A040A0',
  ground: '#E0C068',
  rock: '#B8A038',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#B8B8D0',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  psychic: '#F85888',
  ice: '#98D8D8',
  dragon: '#7038F8',
  dark: '#705848',
  fairy: '#EE99AC',
};

/**
 * Stat name mapping
 */
const STAT_NAMES: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SATK',
  'special-defense': 'SDEF',
  speed: 'SPD',
};

/**
 * Stat display order
 */
const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

/**
 * Capitalizes the first letter of a string
 */
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats ability names (capitalizes and handles hyphens)
 */
const formatAbilityName = (abilityName: string): string => {
  return abilityName
    .split('-')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Formats weight from hectograms to kilograms
 */
const formatWeight = (weight: number): string => {
  return `${(weight / 10).toFixed(1)} kg`;
};

/**
 * Formats height from decimeters to meters
 */
const formatHeight = (height: number): string => {
  return `${(height / 10).toFixed(1)} m`;
};

/**
 * Formats Pokemon ID as a zero-padded string (e.g., 1 -> "#001")
 */
const formatPokemonId = (id: number): string => {
  return `#${String(id).padStart(3, '0')}`;
};

/**
 * Helper function to extract Pokemon ID from URL
 */
const extractPokemonId = (url: string): number => {
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? parseInt(match[1], 10) : 0;
};

/**
 * Sorts Pokemon list by id or name
 */
const sortPokemonList = (
  pokemon: PokemonListItem[],
  sortBy: 'id' | 'name' = 'id',
  sortDir: 'asc' | 'desc' = 'asc'
): PokemonListItem[] => {
  const sorted = [...pokemon];

  if (sortBy === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Sort by ID (extracted from URL)
    sorted.sort((a, b) => {
      const idA = extractPokemonId(a.url);
      const idB = extractPokemonId(b.url);
      return idA - idB;
    });
  }

  // Apply sort direction
  if (sortDir === 'desc') {
    sorted.reverse();
  }

  return sorted;
};

/**
 * Fetches species data for a Pokémon (includes description)
 * @param idOrName - Pokémon ID (number) or name (string)
 * @returns Species data including flavor text
 */
const fetchPokemonSpecies = async (idOrName: number | string) => {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${idOrName}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Pokemon species not found');
    }
    throw new Error(`Failed to fetch Pokemon species: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Extracts the first English flavor text from species data
 * @param speciesData - Raw species data from PokeAPI
 * @returns English description or undefined
 */
const extractDescription = (speciesData: any): string | undefined => {
  if (!speciesData.flavor_text_entries) return undefined;

  const englishEntry = speciesData.flavor_text_entries.find(
    (entry: any) => entry.language?.name === 'en'
  );

  if (englishEntry?.flavor_text) {
    // Clean up the description (remove newlines and extra spaces)
    return englishEntry.flavor_text.replace(/\s+/g, ' ').trim();
  }

  return undefined;
};

/**
 * Formats Pokemon detail response for display
 */
const formatPokemonDetailResponse = (pokemonData: any) => {
  // Get stats in the correct order
  const orderedStats = STAT_ORDER.map(statName => {
    const stat = pokemonData.stats.find((s: any) => s.stat.name === statName);
    return {
      name: STAT_NAMES[statName] || statName.toUpperCase(),
      value: stat?.base_stat || 0,
      displayValue: String(stat?.base_stat || 0).padStart(3, '0'),
    };
  });

  // Get abilities (non-hidden first)
  const abilities = pokemonData.abilities
    .filter((a: any) => !a.is_hidden)
    .map((a: any) => formatAbilityName(a.ability.name));

  // Get types with colors
  const types = pokemonData.types
    .sort((a: any, b: any) => a.slot - b.slot)
    .map((t: any) => ({
      name: capitalize(t.type.name),
      color: TYPE_COLORS[t.type.name] || '#666666',
    }));

  // Select the best image (prefer official artwork)
  const imageUrl = pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default;

  return {
    id: pokemonData.id,
    displayId: formatPokemonId(pokemonData.id),
    name: capitalize(pokemonData.name),
    height: formatHeight(pokemonData.height),
    weight: formatWeight(pokemonData.weight),
    types,
    stats: orderedStats,
    abilities,
    imageUrl,
    description: pokemonData.description,
  };
};

/**
 * Fetches detailed information about a specific Pokémon by ID or name
 * @param idOrName - Pokémon ID (number) or name (string)
 * @returns Formatted complete Pokémon data including types, stats, abilities, description, etc.
 */
export const fetchPokemonDetail = async (idOrName: number | string) => {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${idOrName}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Pokemon not found');
    }
    throw new Error(`Failed to fetch Pokemon detail: ${response.statusText}`);
  }

  const pokemonData = await response.json();

  // Fetch species data for description
  try {
    const speciesData = await fetchPokemonSpecies(idOrName);
    const description = extractDescription(speciesData);
    pokemonData.description = description;
  } catch (error) {
    // If species fetch fails, just continue without description
    console.warn(`Could not fetch species data for Pokemon ${idOrName}:`, error);
  }

  // Format and return the Pokemon data for display
  return formatPokemonDetailResponse(pokemonData);
};
