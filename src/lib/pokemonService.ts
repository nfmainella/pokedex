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
 * Fetches paginated and optionally sorted Pokémon list
 * Supports searching by name, sorting, and pagination on server-side
 */
export const fetchPokemonList = async (
  limit: number,
  offset: number,
  sortBy: 'id' | 'name' = 'id',
  sortDir: 'asc' | 'desc' = 'asc',
  search: string = ''
): Promise<PokemonListResponse> => {
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

    return {
      count: sortedList.length,
      next: next !== null ? buildQueryString(next) : null,
      previous: previous !== null ? buildQueryString(previous) : null,
      results: paginatedResults,
    };
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
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
 * Fetches detailed information about a specific Pokémon by ID or name
 * @param idOrName - Pokémon ID (number) or name (string)
 * @returns Complete Pokémon data including types, stats, abilities, etc.
 */
export const fetchPokemonDetail = async (idOrName: number | string) => {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${idOrName}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Pokemon not found');
    }
    throw new Error(`Failed to fetch Pokemon detail: ${response.statusText}`);
  }

  return response.json();
};
