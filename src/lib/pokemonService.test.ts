import {
  fetchPokemonList,
  fetchPokemonDetail,
} from './pokemonService';

// Mock global fetch
global.fetch = jest.fn();
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('pokemonService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPokemonList', () => {
    const mockMasterList = {
      count: 5,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
        { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon/5/' },
      ],
    };

    it('should fetch Pokemon list with default parameters', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockMasterList),
      } as never);

      const result = await fetchPokemonList(2, 0);

      expect(result.count).toBe(5);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].id).toBe(1);
      expect(result.results[1].id).toBe(2);
      expect(result.next).toBeDefined();
      expect(result.previous).toBeNull();
    });

    it('should format Pokemon results correctly', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockMasterList),
      } as never);

      const result = await fetchPokemonList(1, 0);

      expect(result.results[0]).toEqual({
        id: 1,
        name: 'Bulbasaur',
        displayId: '#001',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
      });
    });

    it('should apply pagination correctly', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockMasterList),
      } as never);

      const result = await fetchPokemonList(2, 2);

      expect(result.results).toHaveLength(2);
      expect(result.results[0].id).toBe(3);
      expect(result.results[1].id).toBe(4);
      expect(result.previous).toBeDefined();
      expect(result.next).toBeDefined();
    });

    it('should set next to null when at end of list', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockMasterList),
      } as never);

      const result = await fetchPokemonList(10, 0);

      expect(result.next).toBeNull();
    });

    it('should set previous to null when at start of list', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockMasterList),
      } as never);

      const result = await fetchPokemonList(2, 0);

      expect(result.previous).toBeNull();
    });

    describe('search functionality', () => {
      it('should filter Pokemon by search term', async () => {
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockMasterList),
        } as never);

        const result = await fetchPokemonList(10, 0, 'id', 'asc', 'char');

        expect(result.count).toBe(2);
        expect(result.results[0].name).toBe('Charmander');
        expect(result.results[1].name).toBe('Charmeleon');
      });

      it('should be case-insensitive search', async () => {
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockMasterList),
        } as never);

        const result = await fetchPokemonList(10, 0, 'id', 'asc', 'BULBA');

        expect(result.count).toBe(1);
        expect(result.results[0].name).toBe('Bulbasaur');
      });

      it('should include search term in query string', async () => {
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockMasterList),
        } as never);

        const result = await fetchPokemonList(2, 0, 'id', 'asc', 'bulba');

        expect(result.next).toContain('search=bulba');
      });

      it('should not include empty search in query string', async () => {
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockMasterList),
        } as never);

        const result = await fetchPokemonList(2, 0, 'id', 'asc', '');

        expect(result.next).not.toContain('search');
      });
    });

    describe('sorting functionality', () => {
      it('should sort by ID ascending', async () => {
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockMasterList),
        } as never);

        const result = await fetchPokemonList(5, 0, 'id', 'asc');

        expect(result.results[0].id).toBe(1);
        expect(result.results[4].id).toBe(5);
      });

      it('should sort by ID descending', async () => {
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockMasterList),
        } as never);

        const result = await fetchPokemonList(5, 0, 'id', 'desc');

        expect(result.results[0].id).toBe(5);
        expect(result.results[4].id).toBe(1);
      });

      it('should sort by name ascending', async () => {
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockMasterList),
        } as never);

        const result = await fetchPokemonList(5, 0, 'name', 'asc');

        expect(result.results[0].name).toBe('Bulbasaur');
        expect(result.results[4].name).toBe('Venusaur');
      });

      it('should sort by name descending', async () => {
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockMasterList),
        } as never);

        const result = await fetchPokemonList(5, 0, 'name', 'desc');

        expect(result.results[0].name).toBe('Venusaur');
        expect(result.results[4].name).toBe('Bulbasaur');
      });
    });

    it('should handle API errors', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as never);

      await expect(fetchPokemonList(10, 0)).rejects.toThrow(
        'Failed to fetch Pokemon list from PokeAPI'
      );
    });

    it('should handle network errors', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchPokemonList(10, 0)).rejects.toThrow();
    });
  });

  describe('fetchPokemonDetail', () => {
    const mockPokemonDetail = {
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      types: [
        { slot: 1, type: { name: 'grass' } },
        { slot: 2, type: { name: 'poison' } },
      ],
      stats: [
        { stat: { name: 'hp' }, base_stat: 45 },
        { stat: { name: 'attack' }, base_stat: 49 },
        { stat: { name: 'defense' }, base_stat: 49 },
        { stat: { name: 'special-attack' }, base_stat: 65 },
        { stat: { name: 'special-defense' }, base_stat: 65 },
        { stat: { name: 'speed' }, base_stat: 45 },
      ],
      abilities: [
        { ability: { name: 'overgrow' }, is_hidden: false },
        { ability: { name: 'chlorophyll' }, is_hidden: true },
      ],
      sprites: {
        front_default: 'https://example.com/sprite.png',
        other: {
          'official-artwork': {
            front_default: 'https://example.com/official-artwork.png',
          },
        },
      },
    };

    const mockSpeciesData = {
      flavor_text_entries: [
        {
          flavor_text: 'A strange seed was planted on\nits back at birth. The plant\nsprouts and grows with this\nPokémon.',
          language: { name: 'en' },
        },
      ],
    };

    it('should fetch Pokemon detail by ID', async () => {
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockPokemonDetail),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Bulbasaur');
      expect(mockedFetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/1');
    });

    it('should fetch Pokemon detail by name', async () => {
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockPokemonDetail),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail('bulbasaur');

      expect(result.name).toBe('Bulbasaur');
      expect(mockedFetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/bulbasaur');
    });

    it('should format response correctly', async () => {
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockPokemonDetail),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail(1);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('displayId');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('height');
      expect(result).toHaveProperty('weight');
      expect(result).toHaveProperty('types');
      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('abilities');
      expect(result).toHaveProperty('imageUrl');
      expect(result).toHaveProperty('description');
    });

    it('should format height and weight correctly', async () => {
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockPokemonDetail),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail(1);

      expect(result.height).toBe('0.7 m');
      expect(result.weight).toBe('6.9 kg');
    });

    it('should format display ID correctly', async () => {
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockPokemonDetail),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail(1);

      expect(result.displayId).toBe('#001');
    });

    it('should extract abilities (non-hidden only)', async () => {
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockPokemonDetail),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail(1);

      expect(result.abilities).toEqual(['Overgrow']);
      expect(result.abilities).not.toContain('Chlorophyll');
    });

    it('should format ability names with hyphens', async () => {
      const pokemonWithHyphenatedAbility = {
        ...mockPokemonDetail,
        abilities: [
          { ability: { name: 'volt-absorb' }, is_hidden: false },
        ],
      };

      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(pokemonWithHyphenatedAbility),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail(1);

      expect(result.abilities[0]).toBe('Volt Absorb');
    });

    it('should include types with colors', async () => {
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockPokemonDetail),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail(1);

      expect(result.types).toHaveLength(2);
      expect(result.types[0]).toEqual({
        name: 'Grass',
        color: '#74CB48',
      });
      expect(result.types[1]).toEqual({
        name: 'Poison',
        color: '#A43E9E',
      });
    });

    it('should include stats in correct order', async () => {
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockPokemonDetail),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail(1);

      const statNames = result.stats.map((s) => s.name);
      expect(statNames).toEqual(['HP', 'ATK', 'DEF', 'SATK', 'SDEF', 'SPD']);
    });

    it('should include description from species data', async () => {
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockPokemonDetail),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail(1);

      expect(result.description).toBeDefined();
      expect(result.description).toContain('A strange seed');
    });

    it('should use official artwork image if available', async () => {
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockPokemonDetail),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail(1);

      expect(result.imageUrl).toBe('https://example.com/official-artwork.png');
    });

    it('should fallback to default sprite if official artwork not available', async () => {
      const pokemonWithoutArtwork = {
        ...mockPokemonDetail,
        sprites: {
          front_default: 'https://example.com/sprite.png',
          other: {},
        },
      };

      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(pokemonWithoutArtwork),
        } as never)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSpeciesData),
        } as never);

      const result = await fetchPokemonDetail(1);

      expect(result.imageUrl).toBe('https://example.com/sprite.png');
    });

    it('should continue without description if species fetch fails', async () => {
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockPokemonDetail),
        } as never)
        .mockResolvedValueOnce({
          ok: false,
          statusText: 'Not Found',
        } as never);

      const result = await fetchPokemonDetail(1);

      expect(result.id).toBe(1);
      expect(result.description).toBeUndefined();
    });

    it('should handle 404 Pokemon not found', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as never);

      await expect(fetchPokemonDetail(9999)).rejects.toThrow('Pokemon not found');
    });

    it('should handle network error', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchPokemonDetail(1)).rejects.toThrow();
    });
  });
});
