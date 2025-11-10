'use client';

import { useState } from 'react';
import { usePokemonQuery } from '@/hooks/usePokemonQuery';
import { type PokemonQueryParams } from '@/lib/types';
import { SearchAndControls } from '@/components/SearchAndControls';
import { PokemonCard } from '@/components/PokemonCard';
import { Icon } from '@/components/ui/Icon';

/**
 * Extracts the Pokémon ID from a PokeAPI URL
 * Example: "https://pokeapi.co/api/v2/pokemon/1/" -> 1
 */
function extractPokemonId(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Transforms a list result item into a PokemonCard-compatible object
 * Uses the PokeAPI sprite URL pattern for images
 */
function transformPokemonListItem(item: { name: string; url: string }) {
  const id = extractPokemonId(item.url);
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  
  return {
    id,
    name: item.name,
    sprites: {
      front_default: spriteUrl,
    },
  };
}

/**
 * PokedexListScreen Component
 * 
 * The main orchestrator component for the Pokédex list view. It:
 * - Manages global query state (search, sort, pagination)
 * - Fetches Pokémon data using usePokemonQuery
 * - Renders SearchAndControls and PokemonCard components
 * - Handles loading, error, and empty states
 * 
 * Follows the exact design specifications with:
 * - Red header (#DC0A2D) with title and Pokeball icon
 * - White scrollable list body with 3-column grid
 * - Proper spacing, shadows, and typography
 */
export function PokedexListScreen() {
  const [limit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'id'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const queryParams: PokemonQueryParams = {
    limit,
    offset,
    search,
    sortBy,
    sortDir,
  };

  const { data, isLoading, isError, error } = usePokemonQuery(queryParams);

  /**
   * Handles search term changes from SearchAndControls
   */
  const handleSearchChange = (term: string) => {
    setSearch(term);
    // Reset to first page when searching
    setOffset(0);
  };

  /**
   * Handles sort changes from SearchAndControls
   */
  const handleSortChange = (sort: 'name' | 'id') => {
    setSortBy(sort);
    // Reset to first page when sorting
    setOffset(0);
  };

  /**
   * Handles pagination - moves to next page
   */
  const handleNextPage = () => {
    if (data?.next) {
      setOffset((prev) => prev + limit);
    }
  };

  /**
   * Handles pagination - moves to previous page
   */
  const handlePreviousPage = () => {
    if (data?.previous) {
      setOffset((prev) => Math.max(0, prev - limit));
    }
  };

  // Loading state - show spinning Pokeball
  if (isLoading) {
    return (
      <div className="w-[360px] h-[640px] bg-[#DC0A2D] p-1 flex items-center justify-center">
        <div className="animate-spin">
          <Icon name="pokeball" size={48} color="#FFFFFF" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-[360px] h-[640px] bg-[#DC0A2D] p-1 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-[328px]">
          <p className="text-center text-gray-900 font-medium">
            Failed to load Pokémon list. Please try again later.
          </p>
          {error && (
            <p className="text-center text-gray-600 text-sm mt-2">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Transform results for PokemonCard
  const pokemonList = data?.results.map(transformPokemonListItem) || [];

  return (
    <div className="w-[360px] h-[640px] bg-[#DC0A2D] p-1 flex flex-col isolate">
      {/* Header Section (Frame 29) */}
      <div className="flex flex-col items-start px-3 pt-3 pb-6 gap-2 w-[352px] h-[108px] flex-none z-[2]">
        {/* Title */}
        <div className="flex flex-row items-center gap-4 w-[328px] h-8">
          <Icon name="pokeball" size={24} color="#FFFFFF" />
          <h1 className="text-2xl font-bold text-white leading-8">
            Pokédex
          </h1>
        </div>

        {/* Filters (SearchAndControls) */}
        <div className="w-[328px] h-8">
          <SearchAndControls
            initialSearch={search}
            onSearchChange={handleSearchChange}
            initialSortBy={sortBy}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      {/* List Body */}
      <div className="bg-white shadow-[inset_0px_1px_3px_1px_rgba(0,0,0,0.25)] rounded-lg pt-6 px-3 pb-0 flex-1 overflow-y-auto z-[1]">
        {pokemonList.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-600 font-medium">
              No Pokémon found.
            </p>
          </div>
        ) : (
          <>
            {/* Grid of Pokemon Cards - 3 columns with 8px gap */}
            <div className="grid grid-cols-3 gap-2 pb-4">
              {pokemonList.map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between py-4 px-2 sticky bottom-0 bg-white border-t border-gray-200">
              <button
                onClick={handlePreviousPage}
                disabled={!data?.previous}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#DC0A2D] shadow-[inset_0px_1px_3px_1px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0px_1px_3px_1px_rgba(0,0,0,0.2)] transition-shadow"
                aria-label="Previous page"
              >
                <Icon name="chevron_left" size={16} color="#DC0A2D" />
              </button>

              <span className="text-xs text-gray-600">
                Page {Math.floor(offset / limit) + 1}
              </span>

              <button
                onClick={handleNextPage}
                disabled={!data?.next}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#DC0A2D] shadow-[inset_0px_1px_3px_1px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0px_1px_3px_1px_rgba(0,0,0,0.2)] transition-shadow"
                aria-label="Next page"
              >
                <Icon name="chevron_right" size={16} color="#DC0A2D" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

