'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';

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
  /** Function to call when a sort option is selected */
  onSortChange: (sort: 'name' | 'id') => void;
}

/**
 * Search Icon Component (Magnifying Glass) - 16px
 */
function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Close/Clear Icon Component (X) - 16px
 */
function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Radio Button Checked Icon - 16px
 */
function RadioButtonChecked() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="7" stroke="#DC0A2D" strokeWidth="1" fill="white" />
      <circle cx="8" cy="8" r="4" fill="#DC0A2D" />
    </svg>
  );
}

/**
 * Radio Button Unchecked Icon - 16px
 */
function RadioButtonUnchecked() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="7" stroke="#DC0A2D" strokeWidth="1" fill="white" />
    </svg>
  );
}

/**
 * SearchAndControls Component
 * 
 * A client-side component that provides:
 * - A search input with 300ms debouncing
 * - A sort button that opens a popup with radio button options (Number/Name)
 * - Proper styling matching the design specifications
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
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        sortButtonRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !sortButtonRef.current.contains(event.target as Node)
      ) {
        setIsSortPopupOpen(false);
      }
    };

    if (isSortPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortPopupOpen]);

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
   * Handles sort option selection
   */
  const handleSortOptionClick = (sort: 'name' | 'id') => {
    onSortChange(sort);
    setIsSortPopupOpen(false);
  };

  /**
   * Handles sort button click - toggles popup
   */
  const handleSortButtonClick = () => {
    setIsSortPopupOpen((prev) => !prev);
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
    <div className="flex flex-row items-center gap-3 sm:gap-4 w-full h-8 sm:h-9">
      {/* Search Bar */}
      <div className="relative flex-1 h-full">
        <div className={`flex flex-row items-center h-full bg-white rounded-2xl ${searchValue
            ? 'pl-3 pr-0 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.2)]'
            : 'px-3 sm:px-4 shadow-[inset_0px_1px_3px_1px_rgba(0,0,0,0.25)]'
          }`}>
          {/* Search Icon */}
          <div className="shrink-0">
            <SearchIcon />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search"
            className="flex-1 px-2 text-xs sm:text-sm leading-5 sm:leading-6 text-text-dark placeholder:text-text-muted bg-transparent border-none outline-none"
            aria-label="Search Pokémon"
          />

          {/* Clear Button Frame (Frame 31) - shown when there's text */}
          {searchValue && (
            <div className="flex items-start justify-center py-2 pr-3 pl-2 w-9 h-8">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label="Clear search"
              >
                <CloseIcon />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sort Button with Popup */}
      <div className="relative shrink-0">
        <button
          ref={sortButtonRef}
          type="button"
          onClick={handleSortButtonClick}
          className="flex items-start justify-center p-1.5 sm:p-2 w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-2xl shadow-[inset_0px_1px_3px_1px_rgba(0,0,0,0.25)] hover:opacity-90 transition-opacity"
          aria-label="Sort options"
          aria-expanded={isSortPopupOpen}
        >
          <Icon
            name={initialSortBy === 'name' ? 'text_format' : 'tag'}
            size={18}
            color="#DC0A2D"
          />
        </button>

        {/* Sort Popup Container */}
        {isSortPopupOpen && (
          <div
            ref={popupRef}
            className="absolute top-full right-0 mt-2 flex flex-col w-[148px] z-50"
          >
            {/* Frame 54 - Red Header */}
            <div className="flex flex-row items-start px-5 py-4 bg-[#DC0A2D] rounded-t-lg">
              <span className="text-xs font-bold leading-4 text-white">
                Sort by:
              </span>
            </div>

            <div className="flex flex-col items-start px-5 py-4 gap-4 bg-white rounded-b-lg shadow-[inset_0px_1px_3px_1px_rgba(0,0,0,0.25)] border-4 border-[#DC0A2D]">
              {/* Radio Button: Number */}
              <label
                className="flex flex-row items-center gap-2 w-full cursor-pointer"
                onClick={() => handleSortOptionClick('id')}
              >
                <div className="shrink-0">
                  {initialSortBy === 'id' ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
                </div>
                <span className="text-xs font-normal leading-4 text-text-dark">Number</span>
              </label>

              {/* Radio Button: Name */}
              <label
                className="flex flex-row items-center gap-2 w-full cursor-pointer"
                onClick={() => handleSortOptionClick('name')}
              >
                <div className="shrink-0">
                  {initialSortBy === 'name' ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
                </div>
                <span className="text-xs font-normal leading-4 text-text-dark">Name</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

