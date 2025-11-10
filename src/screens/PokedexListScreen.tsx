'use client';

import { useState } from 'react';
import { usePokemonQuery } from '@/hooks/usePokemonQuery';
import { type PokemonQueryParams } from '@/lib/types';
import { SearchAndControls } from '@/components/SearchAndControls';
import { PokemonCard } from '@/components/PokemonCard';
import { Icon } from '@/components/ui/Icon';

/**
 * PokedexListScreen Component
 *
 * The main orchestrator component for the Pokédex list view. It:
 * - Manages global query state (search, sort, pagination)
 * - Fetches Pokémon data using usePokemonQuery
 * - Renders SearchAndControls and PokemonCard components
 * - Handles loading, error, and empty states
 * - All data comes pre-formatted from the backend API
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
      <div className="w-full min-h-screen sm:min-h-[640px] bg-[#DC0A2D] p-1 flex items-center justify-center">
        <div className="animate-spin">
          <Icon name="pokeball" size={48} color="#FFFFFF" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full min-h-screen sm:min-h-[640px] bg-[#DC0A2D] p-1 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-4">
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

  return (
    <div className="w-full min-h-screen sm:min-h-[640px] bg-[#DC0A2D] p-1 flex flex-col isolate">
      {/* Header Section (Frame 29) */}
      <div className="flex flex-col items-start px-4 sm:px-6 md:px-8 pt-4 sm:pt-5 pb-5 sm:pb-6 gap-2 sm:gap-3 w-full flex-none z-2">
        {/* Title */}
        <div className="flex flex-row items-center gap-2 sm:gap-4 w-full">
          <Icon name="pokeball" size={28} color="#FFFFFF" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-8 sm:leading-10">
            Pokédex
          </h1>
        </div>

        {/* Filters (SearchAndControls) */}
        <div className="w-full h-8">
          <SearchAndControls
            initialSearch={search}
            onSearchChange={handleSearchChange}
            initialSortBy={sortBy}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      {/* List Body */}
      <div className="bg-white shadow-[inset_0px_1px_3px_1px_rgba(0,0,0,0.25)] rounded-lg pt-6 sm:pt-8 px-4 sm:px-6 md:px-8 pb-0 flex-1 overflow-y-auto z-1">
        {!data?.results || data.results.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-center text-gray-600 font-medium">
              No Pokémon found.
            </p>
          </div>
        ) : (
          <>
            {/* Grid of Pokemon Cards - responsive columns with gap */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 pb-4">
              {data.results.map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between py-4 sm:py-5 px-3 sm:px-4 sticky bottom-0 bg-white border-t border-gray-200">
              <button
                onClick={handlePreviousPage}
                disabled={!data?.previous}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-primary shadow-[inset_0px_1px_3px_1px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0px_1px_3px_1px_rgba(0,0,0,0.2)] transition-shadow"
                aria-label="Previous page"
              >
                <Icon name="chevron_left" size={20} color="#DC0A2D" />
              </button>

              <span className="text-xs sm:text-sm text-gray-600">
                Page {Math.floor(offset / limit) + 1}
              </span>

              <button
                onClick={handleNextPage}
                disabled={!data?.next}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-primary shadow-[inset_0px_1px_3px_1px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0px_1px_3px_1px_rgba(0,0,0,0.2)] transition-shadow"
                aria-label="Next page"
              >
                <Icon name="chevron_right" size={20} color="#DC0A2D" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

