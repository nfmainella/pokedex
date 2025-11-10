import { NextRequest, NextResponse } from 'next/server';
import { fetchPokemonList } from '@/lib/pokemonService';

/**
 * GET /api/pokemon
 * Fetches a paginated and sorted list of Pokémon
 *
 * Query Parameters:
 * - limit: Number of items per page (default: 20)
 * - offset: Starting index (default: 0)
 * - sortBy: 'name' or 'id' (default: 'id')
 * - sortDir: 'asc' or 'desc' (default: 'asc')
 * - search: Optional search query to filter by name
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the request
    const { searchParams } = new URL(request.url);

    // Parse and validate limit
    let limit = 20; // default
    const limitParam = searchParams.get('limit');
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return NextResponse.json(
          { error: 'Invalid limit parameter. Must be a positive number.' },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }

    // Parse and validate offset
    let offset = 0; // default
    const offsetParam = searchParams.get('offset');
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam, 10);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          { error: 'Invalid offset parameter. Must be a non-negative number.' },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Parse sortBy parameter
    const sortByParam = searchParams.get('sortBy');
    const sortBy: 'name' | 'id' = sortByParam === 'name' ? 'name' : 'id';

    // Parse sortDir parameter
    const sortDirParam = searchParams.get('sortDir');
    const sortDir: 'asc' | 'desc' = sortDirParam === 'desc' ? 'desc' : 'asc';

    // Parse search parameter
    const search = searchParams.get('search') || '';

    // Fetch paginated, sorted, and optionally searched Pokemon list
    const pokemonData = await fetchPokemonList(limit, offset, sortBy, sortDir, search);

    return NextResponse.json(pokemonData);
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon list' },
      { status: 500 }
    );
  }
}

