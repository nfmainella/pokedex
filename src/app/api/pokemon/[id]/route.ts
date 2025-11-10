import { NextRequest, NextResponse } from 'next/server';
import { fetchPokemonDetail } from '@/lib/pokemonService';

/**
 * GET /api/pokemon/[id]
 * Fetches detailed information about a specific Pokémon
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Pokémon ID is required' },
        { status: 400 }
      );
    }

    // Fetch Pokémon detail from PokeAPI
    const pokemonData = await fetchPokemonDetail(id);

    return NextResponse.json(pokemonData);
  } catch (error) {
    console.error('Error fetching Pokemon detail:', error);

    // Handle 404 errors
    if (error instanceof Error && error.message === 'Pokemon not found') {
      return NextResponse.json(
        { error: 'Pokémon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch Pokémon detail' },
      { status: 500 }
    );
  }
}

