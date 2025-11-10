'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Props interface for SearchAndControls component
 */
export interface SearchAndControlsProps {
  /** The current search term from parent state */
  initialSearch: string;
  /** Function to call after debouncing is complete */
  onSearchChange: (term: string) => void;
  /** The current active sort order */
  initialSortBy: 'name' | 'id';
  /** Function to call when a sort button is clicked */
  onSortChange: (sort: 'name' | 'id') => void;
}

/**
 * Search Icon Component (Magnifying Glass)
 */
function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 19L14.65 14.65"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Menu/Filter Icon Component (Three Horizontal Lines)
 * @param className - Optional className to control icon color
 */
function MenuIcon({ className = 'text-primary' }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 5H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 10H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 15H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Close/Clear Icon Component (X)
 */
function CloseIcon({ className = 'text-primary' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 4L4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 4L12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * SearchAndControls Component
 * 
 * A client-side component that provides:
 * - A search input with 300ms debouncing
 * - Two sort buttons (Sort by Name A-Z, Sort by ID #)
 * - Active state styling for the selected sort option
 * 
 * The component integrates with parent state management to update
 * search and sort parameters that feed into the usePokemonQuery hook.
 */
export function SearchAndControls({
  initialSearch,
  onSearchChange,
  initialSortBy,
  onSortChange,
}: SearchAndControlsProps) {
  const [searchValue, setSearchValue] = useState(initialSearch);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with parent when initialSearch changes externally
  useEffect(() => {
    setSearchValue(initialSearch);
  }, [initialSearch]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Handles search input changes with 300ms debouncing
   */
  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for 300ms debounce
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  };

  /**
   * Handles sort button clicks
   */
  const handleSortClick = (sort: 'name' | 'id') => {
    onSortChange(sort);
  };

  /**
   * Handles clear button click - immediately clears search and calls onSearchChange
   */
  const handleClear = () => {
    setSearchValue('');
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    // Immediately call onSearchChange with empty string
    onSearchChange('');
  };

  return (
    <div className="bg-[#EFEFEF] rounded-xl p-20 flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <SearchIcon />
        </div>
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            aria-label="Clear search"
          >
            <CloseIcon />
          </button>
        )}
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search"
          className="w-[200px] h-8 pl-10 pr-10 bg-white rounded-full border-none outline-none text-gray-900 placeholder:text-gray-600 shadow-inner-default focus:shadow-outer-active transition-shadow"
          aria-label="Search Pokémon"
        />
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleSortClick('name')}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
            initialSortBy === 'name'
              ? 'bg-primary text-white shadow-outer-active'
              : 'bg-white text-primary shadow-inner-default hover:shadow-outer-active'
          }`}
          aria-label="Sort by Name (A-Z)"
          aria-pressed={initialSortBy === 'name'}
          title="Sort by Name (A-Z)"
        >
          <MenuIcon className={initialSortBy === 'name' ? 'text-white' : 'text-primary'} />
        </button>

        <button
          type="button"
          onClick={() => handleSortClick('id')}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
            initialSortBy === 'id'
              ? 'bg-primary text-white shadow-outer-active'
              : 'bg-white text-primary shadow-inner-default hover:shadow-outer-active'
          }`}
          aria-label="Sort by ID (#)"
          aria-pressed={initialSortBy === 'id'}
          title="Sort by ID (#)"
        >
          <MenuIcon className={initialSortBy === 'id' ? 'text-white' : 'text-primary'} />
        </button>
      </div>
    </div>
  );
}

