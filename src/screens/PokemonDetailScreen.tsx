'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';
import { usePokemonTypeColors } from '@/hooks/usePokemonTypeColors';
import { Icon } from '@/components/ui/Icon';

/**
 * Formats the Pokémon ID as a zero-padded string (e.g., 1 -> "#001")
 */
function formatPokemonId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

/**
 * Capitalizes the first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats weight from hectograms to kilograms
 */
function formatWeight(weight: number): string {
  return `${(weight / 10).toFixed(1)} kg`;
}

/**
 * Formats height from decimeters to meters
 */
function formatHeight(height: number): string {
  return `${(height / 10).toFixed(1)} m`;
}

/**
 * Formats ability names (capitalizes and handles hyphens)
 */
function formatAbilityName(abilityName: string): string {
  return abilityName
    .split('-')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Stat names mapping
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
 * Stat order for display
 */
const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

/**
 * PokemonDetailScreen Component
 * 
 * Displays detailed information about a Pokémon with dynamic colors based on types.
 * Matches the design specifications from the Figma CSS.
 */
export function PokemonDetailScreen({ id }: { id: number | string }) {
  const router = useRouter();
  const { data: pokemon, isLoading, isError, error } = usePokemonDetail(id);
  const { primaryColor, typeColors, typeNames } = usePokemonTypeColors(pokemon || null);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-start p-1 relative w-[360px] h-[640px] bg-gray-300">
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-spin">
            <Icon name="pokeball" size={48} color="#666666" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !pokemon) {
    return (
      <div className="flex flex-col items-start p-1 relative w-[360px] h-[640px] bg-gray-300">
        <div className="flex flex-col items-center justify-center w-full h-full gap-4">
          <p className="text-gray-600">Error loading Pokémon</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formattedId = formatPokemonId(pokemon.id);
  const capitalizedName = capitalize(pokemon.name);
  const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;

  // Get stats in the correct order
  const orderedStats = STAT_ORDER.map(statName => {
    const stat = pokemon.stats.find(s => s.stat.name === statName);
    return {
      name: STAT_NAMES[statName] || statName.toUpperCase(),
      value: stat?.base_stat || 0,
      statName,
    };
  });

  // Get abilities (non-hidden first)
  const abilities = pokemon.abilities
    .filter(a => !a.is_hidden)
    .map(a => formatAbilityName(a.ability.name));

  return (
    <div
      className="flex flex-col items-start p-1 relative w-[360px] h-[640px] isolate"
      style={{ backgroundColor: primaryColor }}
    >
      {/* Title Section - Header with back button, name, and ID */}
      <div className="flex flex-row items-center px-5 pt-5 pb-6 gap-2 w-[352px] h-[76px] z-[3]">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center"
          aria-label="Go back"
        >
          <Icon name="arrow_back" size={32} color="#FFFFFF" />
        </button>
        
        <h1 className="w-[229px] h-8 text-2xl leading-8 font-bold text-white flex items-center flex-grow">
          {capitalizedName}
        </h1>
        
        <span className="w-[35px] h-4 text-xs leading-4 font-bold text-white flex items-center flex-none">
          {formattedId}
        </span>
      </div>

      {/* Image Section with navigation arrows */}
      <div className="flex flex-row justify-between items-end px-5 py-4 gap-2 w-[352px] h-[144px] isolate z-[2]">
        <button
          className="w-6 h-6 flex items-center justify-center"
          aria-label="Previous Pokémon"
        >
          <Icon name="chevron_left" size={24} color="#FFFFFF" />
        </button>
        
        <div className="absolute left-[76px] top-0 w-[200px] h-[200px] z-[2]">
          <Image
            src={imageUrl}
            alt={capitalizedName}
            width={200}
            height={200}
            className="object-contain"
            priority
          />
        </div>
        
        <button
          className="w-6 h-6 flex items-center justify-center"
          aria-label="Next Pokémon"
        >
          <Icon name="chevron_right" size={24} color="#FFFFFF" />
        </button>
      </div>

      {/* Card Section - White card with all details */}
      <div className="flex flex-col items-start pt-14 px-5 pb-5 gap-4 w-[352px] h-[412px] bg-white shadow-inner-default rounded-lg z-[1]">
        {/* Type Chips */}
        <div className="flex flex-row justify-center items-start gap-4 w-[312px] h-5">
          {typeNames.map((typeName, i) => (
            <span
              key={typeName}
              className="px-2 py-0.5 rounded-[10px] text-white text-[10px] leading-4 font-bold flex items-center"
              style={{ backgroundColor: typeColors[i] }}
            >
              {capitalize(typeName)}
            </span>
          ))}
        </div>

        {/* About Section */}
        <h2
          className="w-[312px] h-4 text-sm leading-4 font-bold flex items-center"
          style={{ color: primaryColor }}
        >
          About
        </h2>

        {/* Attributes: Weight, Height, Abilities */}
        <div className="flex flex-row items-start w-[312px] h-12 bg-white">
          {/* Weight */}
          <div className="flex flex-col items-center gap-1 w-[103.33px] h-12 flex-grow">
            <div className="flex flex-row justify-center items-center py-2 gap-2 w-full h-8">
              <Icon name="weight" size={16} color="#1D1D1D" />
              <span className="text-[10px] leading-4 text-[#1D1D1D]">
                {formatWeight(pokemon.weight)}
              </span>
            </div>
            <span className="w-full h-3 text-[8px] leading-3 text-[#666666] text-center">
              Weight
            </span>
          </div>

          <div className="w-px h-12 bg-[#E0E0E0] flex-none" />

          {/* Height */}
          <div className="flex flex-col items-center gap-1 w-[103.33px] h-12 flex-grow">
            <div className="flex flex-row justify-center items-center py-2 gap-2 w-full h-8">
              <Icon name="straighten" size={16} color="#1D1D1D" />
              <span className="text-[10px] leading-4 text-[#1D1D1D]">
                {formatHeight(pokemon.height)}
              </span>
            </div>
            <span className="w-full h-3 text-[8px] leading-3 text-[#666666] text-center">
              Height
            </span>
          </div>

          <div className="w-px h-12 bg-[#E0E0E0] flex-none" />

          {/* Moves/Abilities */}
          <div className="flex flex-col items-center gap-1 w-[103.33px] h-12 flex-grow">
            <div className="flex flex-row items-center gap-2 w-full h-8">
              <span className="text-[10px] leading-4 text-[#1D1D1D]">
                {abilities.join(' ')}
              </span>
            </div>
            <span className="w-full h-3 text-[8px] leading-3 text-[#666666] text-center">
              Moves
            </span>
          </div>
        </div>

        {/* Description placeholder */}
        <p className="w-[312px] h-[60px] text-[10px] leading-4 text-[#1D1D1D] flex items-center text-justify flex-grow">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc iaculis eros vitae tellus condimentum maximus sit amet in eros.
        </p>

        {/* Base Stats Section */}
        <h2
          className="w-[312px] h-4 text-sm leading-4 font-bold flex items-center flex-none"
          style={{ color: primaryColor }}
        >
          Base Stats
        </h2>

        {/* Stats Grid */}
        <div className="flex flex-row items-start gap-2 w-[312px] h-24 bg-white flex-none">
          {/* Labels Column */}
          <div className="flex flex-col items-start pr-1 w-[31px] h-24 flex-none">
            {orderedStats.map((stat) => (
              <div
                key={stat.statName}
                className="w-[27px] h-4 text-[10px] leading-4 font-bold flex items-center text-right flex-none"
                style={{ color: primaryColor }}
              >
                {stat.name}
              </div>
            ))}
          </div>

          <div className="w-px h-24 bg-[#E0E0E0] flex-none" />

          {/* Values Column */}
          <div className="flex flex-col items-start pl-1 w-[23px] h-24 flex-none">
            {orderedStats.map((stat) => (
              <div
                key={stat.statName}
                className="w-[19px] h-4 text-[10px] leading-4 text-[#1D1D1D] flex items-center flex-none"
              >
                {stat.value}
              </div>
            ))}
          </div>

          {/* Chart Column */}
          <div className="flex flex-col items-start w-[233px] h-24 grow">
            {orderedStats.map((stat) => {
              const percentage = Math.min((stat.value / 255) * 100, 100);
              return (
                <div key={stat.statName} className="flex flex-col justify-center items-start w-full h-4 flex-none">
                  <div className="flex flex-row items-start w-full h-1 rounded mb-[-4px]">
                    <div
                      className="h-full rounded grow"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: primaryColor,
                      }}
                    />
                  </div>
                  <div
                    className="w-full h-1 rounded"
                    style={{
                      backgroundColor: `${primaryColor}33`, // 20% opacity
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pokeball Background Decoration */}
      <div className="absolute right-2 top-2 w-[208px] h-[208px] opacity-10 z-0">
        <Icon name="pokeball" size={208} color="#FFFFFF" />
      </div>
    </div>
  );
}

