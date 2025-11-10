import { usePokemonTypeColors, PokemonWithTypes } from './usePokemonTypeColors';
import { renderHook } from '@testing-library/react';
import * as pokemonTypesModule from '@/lib/pokemonTypes';

// Mock the pokemonTypes module
jest.mock('@/lib/pokemonTypes', () => ({
  getPrimaryTypeColor: jest.fn((types: string[]) => types[0] ? '#FF0000' : '#666666'),
  getTypeColors: jest.fn((types: string[]) => types.map(() => '#FF0000')),
}));

describe('usePokemonTypeColors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with valid pokemon', () => {
    it('should return primary color and type colors for pokemon with types', () => {
      const pokemon: PokemonWithTypes = {
        types: [
          { type: { name: 'fire' } },
          { type: { name: 'flying' } },
        ],
      };

      const { result } = renderHook(() => usePokemonTypeColors(pokemon));

      expect(result.current.primaryColor).toBe('#FF0000');
      expect(result.current.typeColors).toEqual(['#FF0000', '#FF0000']);
      expect(result.current.typeNames).toEqual(['fire', 'flying']);
    });

    it('should extract type names from nested type structure', () => {
      const pokemon: PokemonWithTypes = {
        types: [
          { type: { name: 'water' } },
          { type: { name: 'psychic' } },
          { type: { name: 'ghost' } },
        ],
      };

      const { result } = renderHook(() => usePokemonTypeColors(pokemon));

      expect(result.current.typeNames).toEqual(['water', 'psychic', 'ghost']);
    });

    it('should handle single type pokemon', () => {
      const pokemon: PokemonWithTypes = {
        types: [{ type: { name: 'grass' } }],
      };

      const { result } = renderHook(() => usePokemonTypeColors(pokemon));

      expect(result.current.typeNames).toEqual(['grass']);
      expect(result.current.typeColors).toHaveLength(1);
    });

    it('should call getPrimaryTypeColor with extracted type names', () => {
      const pokemon: PokemonWithTypes = {
        types: [
          { type: { name: 'electric' } },
          { type: { name: 'steel' } },
        ],
      };

      renderHook(() => usePokemonTypeColors(pokemon));

      expect(pokemonTypesModule.getPrimaryTypeColor).toHaveBeenCalledWith(['electric', 'steel']);
    });

    it('should call getTypeColors with extracted type names', () => {
      const pokemon: PokemonWithTypes = {
        types: [
          { type: { name: 'fire' } },
          { type: { name: 'flying' } },
        ],
      };

      renderHook(() => usePokemonTypeColors(pokemon));

      expect(pokemonTypesModule.getTypeColors).toHaveBeenCalledWith(['fire', 'flying']);
    });
  });

  describe('with null or undefined pokemon', () => {
    it('should return default values for null pokemon', () => {
      const { result } = renderHook(() => usePokemonTypeColors(null));

      expect(result.current.primaryColor).toBe('#666666');
      expect(result.current.typeColors).toEqual(['#666666']);
      expect(result.current.typeNames).toEqual([]);
    });

    it('should return default values for undefined pokemon', () => {
      const { result } = renderHook(() => usePokemonTypeColors(undefined));

      expect(result.current.primaryColor).toBe('#666666');
      expect(result.current.typeColors).toEqual(['#666666']);
      expect(result.current.typeNames).toEqual([]);
    });
  });

  describe('with empty or invalid types', () => {
    it('should return default values for pokemon with empty types array', () => {
      const pokemon: PokemonWithTypes = {
        types: [],
      };

      const { result } = renderHook(() => usePokemonTypeColors(pokemon));

      expect(result.current.primaryColor).toBe('#666666');
      expect(result.current.typeColors).toEqual(['#666666']);
      expect(result.current.typeNames).toEqual([]);
    });

    it('should return default values for pokemon with no types property', () => {
      const pokemon = {} as PokemonWithTypes;

      const { result } = renderHook(() => usePokemonTypeColors(pokemon));

      expect(result.current.primaryColor).toBe('#666666');
      expect(result.current.typeColors).toEqual(['#666666']);
      expect(result.current.typeNames).toEqual([]);
    });
  });

  describe('memoization', () => {
    it('should return same reference for same pokemon object', () => {
      const pokemon: PokemonWithTypes = {
        types: [{ type: { name: 'fire' } }],
      };

      const { result, rerender } = renderHook(() => usePokemonTypeColors(pokemon));

      const firstResult = result.current;

      rerender();

      expect(result.current).toBe(firstResult);
    });

    it('should return new reference when pokemon changes', () => {
      const pokemon1: PokemonWithTypes = {
        types: [{ type: { name: 'fire' } }],
      };

      const pokemon2: PokemonWithTypes = {
        types: [{ type: { name: 'water' } }],
      };

      const { result, rerender } = renderHook(
        ({ pokemon }) => usePokemonTypeColors(pokemon),
        { initialProps: { pokemon: pokemon1 } }
      );

      const firstResult = result.current;

      rerender({ pokemon: pokemon2 });

      expect(result.current).not.toBe(firstResult);
    });

    it('should return same reference when types array is same', () => {
      const pokemon: PokemonWithTypes = {
        types: [
          { type: { name: 'fire' } },
          { type: { name: 'flying' } },
        ],
      };

      const { result, rerender } = renderHook(() => usePokemonTypeColors(pokemon));

      const firstResult = result.current;

      rerender();

      expect(result.current).toBe(firstResult);
    });
  });
});
