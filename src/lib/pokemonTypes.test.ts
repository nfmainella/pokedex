import {
  POKEMON_TYPE_COLORS,
  getTypeColor,
  getPrimaryTypeColor,
  getTypeColors,
} from './pokemonTypes';

describe('pokemonTypes', () => {
  describe('POKEMON_TYPE_COLORS', () => {
    it('should contain all 18 Pokemon types', () => {
      const expectedTypes = [
        'normal',
        'fighting',
        'flying',
        'poison',
        'ground',
        'rock',
        'bug',
        'ghost',
        'steel',
        'fire',
        'water',
        'grass',
        'electric',
        'psychic',
        'ice',
        'dragon',
        'dark',
        'fairy',
      ];

      expectedTypes.forEach((type) => {
        expect(POKEMON_TYPE_COLORS[type]).toBeDefined();
        expect(typeof POKEMON_TYPE_COLORS[type]).toBe('string');
        // Verify it's a valid hex color
        expect(POKEMON_TYPE_COLORS[type]).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have 18 types total', () => {
      expect(Object.keys(POKEMON_TYPE_COLORS).length).toBe(18);
    });
  });

  describe('getTypeColor', () => {
    it('should return the correct color for a valid type', () => {
      expect(getTypeColor('fire')).toBe('#F57D31');
      expect(getTypeColor('water')).toBe('#6493EB');
      expect(getTypeColor('grass')).toBe('#74CB48');
    });

    it('should be case-insensitive', () => {
      expect(getTypeColor('FIRE')).toBe('#F57D31');
      expect(getTypeColor('Fire')).toBe('#F57D31');
      expect(getTypeColor('fIrE')).toBe('#F57D31');
    });

    it('should return default gray color for unknown types', () => {
      expect(getTypeColor('unknown')).toBe('#666666');
      expect(getTypeColor('xyz')).toBe('#666666');
      expect(getTypeColor('')).toBe('#666666');
    });
  });

  describe('getPrimaryTypeColor', () => {
    it('should return the color of the first type', () => {
      expect(getPrimaryTypeColor(['fire', 'flying'])).toBe('#F57D31');
      expect(getPrimaryTypeColor(['water', 'ice'])).toBe('#6493EB');
    });

    it('should handle single type array', () => {
      expect(getPrimaryTypeColor(['grass'])).toBe('#74CB48');
    });

    it('should return default gray for empty array', () => {
      expect(getPrimaryTypeColor([])).toBe('#666666');
    });

    it('should return default gray for null or undefined', () => {
      expect(getPrimaryTypeColor(null as any)).toBe('#666666');
      expect(getPrimaryTypeColor(undefined as any)).toBe('#666666');
    });

    it('should be case-insensitive', () => {
      expect(getPrimaryTypeColor(['FIRE', 'FLYING'])).toBe('#F57D31');
      expect(getPrimaryTypeColor(['FiRe'])).toBe('#F57D31');
    });
  });

  describe('getTypeColors', () => {
    it('should return colors for all types in the array', () => {
      const result = getTypeColors(['fire', 'flying', 'dragon']);
      expect(result).toEqual(['#F57D31', '#A891EC', '#7037FF']);
    });

    it('should handle single type', () => {
      expect(getTypeColors(['water'])).toEqual(['#6493EB']);
    });

    it('should return array with default gray for empty array', () => {
      expect(getTypeColors([])).toEqual(['#666666']);
    });

    it('should return array with default gray for null/undefined', () => {
      expect(getTypeColors(null as any)).toEqual(['#666666']);
      expect(getTypeColors(undefined as any)).toEqual(['#666666']);
    });

    it('should be case-insensitive for all types', () => {
      const result = getTypeColors(['FIRE', 'Water', 'GRASS']);
      expect(result).toEqual(['#F57D31', '#6493EB', '#74CB48']);
    });

    it('should include default gray for unknown types mixed with known types', () => {
      const result = getTypeColors(['fire', 'unknown', 'water']);
      expect(result).toEqual(['#F57D31', '#666666', '#6493EB']);
    });

    it('should maintain order of types', () => {
      const types1 = getTypeColors(['water', 'fire']);
      const types2 = getTypeColors(['fire', 'water']);
      expect(types1).not.toEqual(types2);
      expect(types1[0]).toBe('#6493EB');
      expect(types1[1]).toBe('#F57D31');
      expect(types2[0]).toBe('#F57D31');
      expect(types2[1]).toBe('#6493EB');
    });
  });
});
