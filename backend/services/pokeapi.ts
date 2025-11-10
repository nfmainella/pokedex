import axios from 'axios';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

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

export const fetchPokemonList = async (
  limit: number,
  offset: number
): Promise<PokemonListResponse> => {
  const response = await axios.get<PokemonListResponse>(
    `${POKEAPI_BASE_URL}/pokemon`,
    {
      params: {
        limit,
        offset,
      },
    }
  );

  return response.data;
};

