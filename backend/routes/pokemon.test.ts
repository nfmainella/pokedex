import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import pokemonRoutes from './pokemon';
import * as pokeapiService from '../services/pokeapi';

// Set environment variable for JWT_SECRET
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.NODE_ENV = 'development';

// Mock the pokeapi service
jest.mock('../services/pokeapi');

// Create a test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', pokemonRoutes);

// Helper function to create a valid auth token
const createAuthToken = (): string => {
  return jwt.sign({ username: 'admin' }, process.env.JWT_SECRET!, {
    expiresIn: '24h',
  });
};

describe('Pokemon Routes', () => {
  const mockFetchPokemonList = pokeapiService.fetchPokemonList as jest.MockedFunction<
    typeof pokeapiService.fetchPokemonList
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/pokemon', () => {
    const mockPokemonData = {
      count: 1302,
      next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
      previous: null,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
        { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
      ],
    };

    it('should return 401 when no auth_token cookie is provided', async () => {
      const response = await request(app)
        .get('/api/pokemon')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized: No token provided');
      expect(mockFetchPokemonList).not.toHaveBeenCalled();
    });

    it('should return 200 with valid auth_token cookie', async () => {
      const token = createAuthToken();
      mockFetchPokemonList.mockResolvedValue(mockPokemonData);

      const response = await request(app)
        .get('/api/pokemon')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('count', 1302);
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toHaveLength(5);
      expect(mockFetchPokemonList).toHaveBeenCalledWith(20, 0); // default values
    });

    it('should correctly parse and pass limit and offset query parameters to the service', async () => {
      const token = createAuthToken();
      mockFetchPokemonList.mockResolvedValue(mockPokemonData);

      await request(app)
        .get('/api/pokemon?limit=10&offset=5')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(mockFetchPokemonList).toHaveBeenCalledWith(10, 5);
      expect(mockFetchPokemonList).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for invalid limit parameter', async () => {
      const token = createAuthToken();

      const response = await request(app)
        .get('/api/pokemon?limit=-5')
        .set('Cookie', `auth_token=${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid limit parameter');
      expect(mockFetchPokemonList).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid offset parameter', async () => {
      const token = createAuthToken();

      const response = await request(app)
        .get('/api/pokemon?offset=-1')
        .set('Cookie', `auth_token=${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid offset parameter');
      expect(mockFetchPokemonList).not.toHaveBeenCalled();
    });

    it('should correctly sort by name when sortBy=name is provided', async () => {
      const token = createAuthToken();
      mockFetchPokemonList.mockResolvedValue(mockPokemonData);

      const response = await request(app)
        .get('/api/pokemon?sortBy=name')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.results).toHaveLength(5);
      // Check that results are sorted by name alphabetically
      const names = response.body.results.map((p: { name: string }) => p.name);
      expect(names).toEqual(['bulbasaur', 'charizard', 'charmander', 'ivysaur', 'venusaur']);
    });

    it('should correctly sort by id (default) when sortBy is not provided', async () => {
      const token = createAuthToken();
      mockFetchPokemonList.mockResolvedValue(mockPokemonData);

      const response = await request(app)
        .get('/api/pokemon')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.results).toHaveLength(5);
      // Check that results are sorted by ID (extracted from URL)
      const ids = response.body.results.map((p: { url: string }) => {
        const match = p.url.match(/\/pokemon\/(\d+)\//);
        return match ? parseInt(match[1], 10) : 0;
      });
      expect(ids).toEqual([1, 2, 3, 4, 6]); // Sorted by ID
    });

    it('should correctly sort by id when sortBy=id is explicitly provided', async () => {
      const token = createAuthToken();
      mockFetchPokemonList.mockResolvedValue(mockPokemonData);

      const response = await request(app)
        .get('/api/pokemon?sortBy=id')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.results).toHaveLength(5);
      // Check that results are sorted by ID
      const ids = response.body.results.map((p: { url: string }) => {
        const match = p.url.match(/\/pokemon\/(\d+)\//);
        return match ? parseInt(match[1], 10) : 0;
      });
      expect(ids).toEqual([1, 2, 3, 4, 6]);
    });

    it('should handle invalid sortBy parameter by defaulting to id', async () => {
      const token = createAuthToken();
      mockFetchPokemonList.mockResolvedValue(mockPokemonData);

      const response = await request(app)
        .get('/api/pokemon?sortBy=invalid')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.results).toHaveLength(5);
      // Should still be sorted by ID (default)
      const ids = response.body.results.map((p: { url: string }) => {
        const match = p.url.match(/\/pokemon\/(\d+)\//);
        return match ? parseInt(match[1], 10) : 0;
      });
      expect(ids).toEqual([1, 2, 3, 4, 6]);
    });

    it('should return 500 when external API fails', async () => {
      const token = createAuthToken();
      mockFetchPokemonList.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/api/pokemon')
        .set('Cookie', `auth_token=${token}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Failed to fetch Pokemon list');
    });
  });
});

