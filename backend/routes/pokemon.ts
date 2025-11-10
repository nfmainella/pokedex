import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { fetchPokemonList, PokemonListItem } from '../services/pokeapi';

const router = Router();

// Helper function to extract Pokemon ID from URL
const extractPokemonId = (url: string): number => {
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? parseInt(match[1], 10) : 0;
};

// Helper function to sort Pokemon list
const sortPokemonList = (
  pokemon: PokemonListItem[],
  sortBy: 'name' | 'id' = 'id'
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

  return sorted;
};

router.get('/pokemon', protect, async (req: Request, res: Response) => {
  try {
    // Parse and validate limit
    let limit = 20; // default
    if (req.query.limit !== undefined) {
      const parsedLimit = parseInt(req.query.limit as string, 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return res.status(400).json({
          error: 'Invalid limit parameter. Must be a positive number.',
        });
      }
      limit = parsedLimit;
    }

    // Parse and validate offset
    let offset = 0; // default
    if (req.query.offset !== undefined) {
      const parsedOffset = parseInt(req.query.offset as string, 10);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return res.status(400).json({
          error: 'Invalid offset parameter. Must be a non-negative number.',
        });
      }
      offset = parsedOffset;
    }

    // Parse sortBy parameter
    const sortBy = req.query.sortBy as string;
    const validSortBy = sortBy === 'name' ? 'name' : 'id';

    // Fetch Pokemon list from external API
    const pokemonData = await fetchPokemonList(limit, offset);

    // Sort the results
    const sortedResults = sortPokemonList(pokemonData.results, validSortBy);

    // Return paginated and sorted data
    return res.status(200).json({
      count: pokemonData.count,
      next: pokemonData.next,
      previous: pokemonData.previous,
      results: sortedResults,
    });
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    return res.status(500).json({
      error: 'Failed to fetch Pokemon list from external API',
    });
  }
});

export default router;

