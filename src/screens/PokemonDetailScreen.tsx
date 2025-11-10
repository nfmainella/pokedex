'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';
import { Icon } from '@/components/ui/Icon';

/**
 * PokemonDetailScreen Component
 *
 * Displays detailed information about a Pokémon with dynamic colors based on types.
 * All data formatting is done on the backend, this component just displays it.
 */
export function PokemonDetailScreen({ id }: { id: number | string }) {
  const router = useRouter();
  const { data: pokemon, isLoading, isError } = usePokemonDetail(id);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-start p-1 relative bg-gray-300">
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-spin">
            <Icon name="pokeball" size={48} color="rgb(102, 102, 102)" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !pokemon) {
    return (
      <div className="flex flex-col items-start p-1 relative bg-gray-300">
        <div className="flex flex-col items-center justify-center w-full h-full gap-4">
          <p className="text-gray-600">Error loading Pokémon</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#DC0A2D] text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get primary color from first type for styling
  const primaryColor = pokemon.types[0]?.color || '#666666';

  /**
   * Navigate to the next Pokémon
   */
  const handleNextPokemon = () => {
    const nextId = pokemon.id + 1;
    router.push(`/pokemon/${nextId}`);
  };

  /**
   * Navigate to the previous Pokémon
   */
  const handlePreviousPokemon = () => {
    if (pokemon.id > 1) {
      const prevId = pokemon.id - 1;
      router.push(`/pokemon/${prevId}`);
    }
  };

  return (
    <div
      className="flex flex-col items-start p-0 relative w-full h-full isolate"
      style={{ backgroundColor: primaryColor, maxWidth: '100%' }}
    >
      {/* Title Section - Header with back button, name, and ID */}
      <div className="flex flex-row items-center px-4 sm:px-6 pt-4 sm:pt-5 pb-5 sm:pb-6 gap-2 w-full flex-none z-3">
        <button
          onClick={() => router.push('/')}
          className="w-8 h-8 flex items-center justify-center shrink-0"
          aria-label="Go Home"
        >
          <Icon name="arrow_back" size={32} color="rgb(255, 255, 255)" />
        </button>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-8 sm:leading-10 flex items-center grow min-w-0 truncate">
          {pokemon.name}
        </h1>

        <span className="text-sm sm:text-base font-bold text-white leading-4 sm:leading-6 flex items-center shrink-0">
          {pokemon.displayId}
        </span>
      </div>

      {/* Image Section with navigation arrows */}
      <div className="flex flex-row justify-between px-5 py-6 gap-2 w-full flex-[0.35] isolate relative z-20 mb-8 sm:mb-12 items-end">
        <button
          onClick={handlePreviousPokemon}
          disabled={pokemon.id <= 1}
          className="w-6 h-6 flex items-center justify-center shrink-0 z-10 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
          aria-label="Previous Pokémon"
        >
          <Icon name="chevron_left" size={24} color="rgb(255, 255, 255)" />
        </button>

        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-30 flex items-center justify-center w-50 h-50 aspect-square">
          <Image
            width={200}
            height={200}
            src={pokemon.imageUrl}
            alt={pokemon.name}
            className="object-contain w-full h-full"
            priority
          />
        </div>

        <button
          onClick={handleNextPokemon}
          className="w-6 h-6 flex items-center justify-center shrink-0 z-10 hover:opacity-80 transition-opacity"
          aria-label="Next Pokémon"
        >
          <Icon name="chevron_right" size={24} color="rgb(255, 255, 255)" />
        </button>
      </div>

      {/* Card Container with padding to show colored background */}
      <div className="w-full px-3 sm:px-4 md:px-6 flex-[0.65] z-10 mb-3 sm:mb-4">
        {/* Card Section - White card with all details */}
        <div className="flex flex-col items-start justify-evenly pt-6 sm:pt-8 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 gap-4 sm:gap-6 w-full bg-white rounded-3xl">
          {/* Type Chips */}
          <div className="flex flex-row justify-center items-start gap-3 sm:gap-4 w-full flex-none mt-8">
            {pokemon.types.map((type) => (
              <span
                key={type.name}
                className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-[10px] text-white text-xs sm:text-sm leading-5 sm:leading-6 font-bold flex items-center whitespace-nowrap"
                style={{ backgroundColor: type.color }}
              >
                {type.name}
              </span>
            ))}
          </div>

          {/* About Section */}
          <h2
            className="w-full text-base sm:text-lg md:text-xl leading-6 sm:leading-8 font-bold flex items-center justify-center text-center flex-none"
            style={{ color: primaryColor }}
          >
            About
          </h2>

          {/* Attributes: Weight, Height, Abilities */}
          <div className="flex flex-row items-center w-full gap-3 sm:gap-4 flex-none py-2 sm:py-3">
            {/* Weight */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 grow min-w-0">
              <div className="flex flex-row justify-center items-center py-1 sm:py-2 gap-2 w-full flex-none">
                <Icon name="weight" size={18} color="rgb(29, 29, 29)" />
                <span className="text-xs sm:text-sm leading-5 sm:leading-6 text-text-dark text-justify">
                  {pokemon.weight}
                </span>
              </div>
              <span className="w-full text-xs sm:text-sm leading-4 sm:leading-5 text-gray-500 text-center flex-none">
                Weight
              </span>
            </div>

            <div className="w-px h-14 sm:h-16 bg-gray-200 flex-none" />

            {/* Height */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 grow min-w-0">
              <div className="flex flex-row justify-center items-center py-1 sm:py-2 gap-2 w-full flex-none">
                <Icon name="straighten" size={18} color="rgb(29, 29, 29)" />
                <span className="text-xs sm:text-sm leading-5 sm:leading-6 text-text-dark text-justify">
                  {pokemon.height}
                </span>
              </div>
              <span className="w-full text-xs sm:text-sm leading-4 sm:leading-5 text-gray-500 text-center flex-none">
                Height
              </span>
            </div>

            <div className="w-px h-14 sm:h-16 bg-gray-200 flex-none" />

            {/* Moves/Abilities */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 grow min-w-0">
              <div className="flex flex-row items-center justify-center gap-2 w-full flex-none overflow-hidden">
                <span className="text-xs sm:text-sm leading-5 sm:leading-6 text-text-dark text-center line-clamp-2">
                  {pokemon.abilities.length > 0 ? pokemon.abilities.join(', ') : 'None'}
                </span>
              </div>
              <span className="w-full text-xs sm:text-sm leading-4 sm:leading-5 text-gray-500 text-center flex-none">
                Abilities
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm leading-5 sm:leading-6 text-text-dark text-center w-full">
            {pokemon.description || 'No description available.'}
          </p>

          {/* Base Stats Section */}
          <h2
            className="w-full text-base sm:text-lg md:text-xl leading-6 sm:leading-8 font-bold flex items-center justify-center text-center flex-none"
            style={{ color: primaryColor }}
          >
            Base Stats
          </h2>

          {/* Stats Grid */}
          <div className="flex flex-row items-start gap-2 sm:gap-3 w-full bg-white flex-none">
            {/* Labels Column */}
            <div className="flex flex-col items-start pr-1 sm:pr-2 gap-2 sm:gap-3 flex-none">
              {pokemon.stats.map((stat) => (
                <div
                  key={stat.name}
                  className="text-xs sm:text-sm leading-5 sm:leading-6 font-bold flex items-center text-right flex-none"
                  style={{ color: primaryColor }}
                >
                  {stat.name}
                </div>
              ))}
            </div>

            <div className="w-px bg-gray-200 flex-none self-stretch" />

            {/* Values Column */}
            <div className="flex flex-col items-start pl-1 sm:pl-2 gap-2 sm:gap-3 flex-none">
              {pokemon.stats.map((stat) => (
                <div
                  key={stat.name}
                  className="text-xs sm:text-sm leading-5 sm:leading-6 text-text-dark flex items-center flex-none"
                >
                  {stat.displayValue}
                </div>
              ))}
            </div>

            {/* Chart Column */}
            <div className="flex flex-col items-start gap-7.5 grow">
              {pokemon.stats.map((stat) => {
                const percentage = Math.min((stat.value / 255) * 100, 100);
                return (
                  <div key={stat.name} className="flex flex-col items-start w-full flex-none">
                    <div className="relative w-full h-1.5 sm:h-2">
                      {/* Background bar */}
                      <div
                        className="absolute inset-0 w-full h-full rounded-[4px]"
                        style={{
                          backgroundColor: `${primaryColor}33`, // 20% opacity
                        }}
                      />
                      {/* Value bar */}
                      <div
                        className="absolute inset-0 h-full rounded-[4px]"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: primaryColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pokeball Background Decoration */}
      <div className="absolute right-2 top-2 w-[208px] h-[208px] opacity-10 z-0">
        <Icon name="pokeball" size={208} color="rgb(255, 255, 255)" />
      </div>
    </div>
  );
}

