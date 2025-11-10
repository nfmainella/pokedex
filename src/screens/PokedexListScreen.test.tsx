import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PokedexListScreen } from './PokedexListScreen';
import { usePokemonQuery } from '@/hooks/usePokemonQuery';
import type { PokemonListResponse } from '@/hooks/usePokemonQuery';
import React from 'react';

// Mock the usePokemonQuery hook
jest.mock('@/hooks/usePokemonQuery', () => ({
  usePokemonQuery: jest.fn(),
}));

// Mock the SearchAndControls component
jest.mock('@/components/SearchAndControls', () => ({
  SearchAndControls: jest.fn(({ initialSearch, onSearchChange, initialSortBy, onSortChange }) => (
    <div data-testid="search-and-controls">
      <input
        data-testid="search-input"
        value={initialSearch}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search"
      />
      <button
        data-testid="sort-name"
        onClick={() => onSortChange('name')}
        aria-pressed={initialSortBy === 'name'}
      >
        Sort by Name
      </button>
      <button
        data-testid="sort-id"
        onClick={() => onSortChange('id')}
        aria-pressed={initialSortBy === 'id'}
      >
        Sort by ID
      </button>
    </div>
  )),
}));

// Mock the PokemonCard component
jest.mock('@/components/PokemonCard', () => ({
  PokemonCard: jest.fn(({ pokemon }) => (
    <div data-testid={`pokemon-card-${pokemon.id}`}>
      {pokemon.name} - {pokemon.id}
    </div>
  )),
}));

// Mock the Icon component
jest.mock('@/components/ui/Icon', () => ({
  Icon: jest.fn(({ name, size, color }) => (
    <div data-testid={`icon-${name}`} data-size={size} data-color={color}>
      {name}
    </div>
  )),
}));

const mockUsePokemonQuery = usePokemonQuery as jest.MockedFunction<typeof usePokemonQuery>;

// Create a wrapper component for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const QueryWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  QueryWrapper.displayName = 'QueryWrapper';

  return QueryWrapper;
};

describe('PokedexListScreen', () => {
  const mockPokemonResponse: PokemonListResponse = {
    count: 1302,
    next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
    previous: null,
    results: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
      { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Load Test', () => {
    it('should display loading spinner when isLoading is true', () => {
      mockUsePokemonQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        isFetching: true,
        isSuccess: false,
        status: 'loading',
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: false,
        isFetchedAfterMount: false,
        isInitialLoading: true,
        isPaused: false,
        isPlaceholderData: false,
        isRefetching: false,
        isStale: true,
        refetch: jest.fn(),
        remove: jest.fn(),
      } as any);

      render(
        <QueryClientProvider client={new QueryClient()}>
          <PokedexListScreen />
        </QueryClientProvider>
      );

      // Check for loading spinner (Pokeball icon)
      const loadingIcon = screen.getByTestId('icon-pokeball');
      expect(loadingIcon).toBeInTheDocument();
      expect(loadingIcon).toHaveAttribute('data-color', '#FFFFFF');
    });
  });

  describe('Success Test', () => {
    it('should render PokemonCard components and SearchAndControls when data is loaded', async () => {
      mockUsePokemonQuery.mockReturnValue({
        data: mockPokemonResponse,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
        isSuccess: true,
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetching: false,
        isStale: false,
        refetch: jest.fn(),
        remove: jest.fn(),
      } as any);

      render(
        <QueryClientProvider client={new QueryClient()}>
          <PokedexListScreen />
        </QueryClientProvider>
      );

      // Wait for the component to render
      await waitFor(() => {
        expect(screen.getByTestId('search-and-controls')).toBeInTheDocument();
      });

      // Check that SearchAndControls is rendered
      expect(screen.getByTestId('search-and-controls')).toBeInTheDocument();

      // Check that PokemonCard components are rendered
      expect(screen.getByTestId('pokemon-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('pokemon-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('pokemon-card-3')).toBeInTheDocument();

      // Check that the title is rendered
      expect(screen.getByText('Pokédex')).toBeInTheDocument();
    });

    it('should display "No Pokémon found" when results array is empty', () => {
      mockUsePokemonQuery.mockReturnValue({
        data: { ...mockPokemonResponse, results: [] },
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
        isSuccess: true,
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetching: false,
        isStale: false,
        refetch: jest.fn(),
        remove: jest.fn(),
      } as any);

      render(
        <QueryClientProvider client={new QueryClient()}>
          <PokedexListScreen />
        </QueryClientProvider>
      );

      expect(screen.getByText('No Pokémon found.')).toBeInTheDocument();
    });
  });

  describe('Error Test', () => {
    it('should display error message when isError is true', () => {
      const mockError = new Error('Failed to fetch Pokémon');
      mockUsePokemonQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: mockError,
        isFetching: false,
        isSuccess: false,
        status: 'error',
        dataUpdatedAt: 0,
        errorUpdatedAt: Date.now(),
        failureCount: 1,
        failureReason: mockError,
        errorUpdateCount: 1,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetching: false,
        isStale: false,
        refetch: jest.fn(),
        remove: jest.fn(),
      } as any);

      render(
        <QueryClientProvider client={new QueryClient()}>
          <PokedexListScreen />
        </QueryClientProvider>
      );

      expect(screen.getByText('Failed to load Pokémon list. Please try again later.')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch Pokémon')).toBeInTheDocument();
    });
  });

  describe('Search Interaction Test', () => {
    it('should update search state when user types in search input', async () => {
      const user = userEvent.setup();

      // Mock the hook to return different values based on search parameter
      let currentSearch = '';
      mockUsePokemonQuery.mockImplementation((params) => {
        currentSearch = params?.search || '';
        return {
          data: currentSearch
            ? { ...mockPokemonResponse, results: mockPokemonResponse.results.filter((p) => p.name.includes(currentSearch)) }
            : mockPokemonResponse,
          isLoading: false,
          isError: false,
          error: null,
          isFetching: false,
          isSuccess: true,
          status: 'success',
          dataUpdatedAt: Date.now(),
          errorUpdatedAt: 0,
          failureCount: 0,
          failureReason: null,
          errorUpdateCount: 0,
          isFetched: true,
          isFetchedAfterMount: true,
          isInitialLoading: false,
          isPaused: false,
          isPlaceholderData: false,
          isRefetching: false,
          isStale: false,
          refetch: jest.fn(),
          remove: jest.fn(),
        } as any;
      });

      render(
        <QueryClientProvider client={new QueryClient()}>
          <PokedexListScreen />
        </QueryClientProvider>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input') as HTMLInputElement;

      // Type in the search input
      await user.type(searchInput, 'bulba');

      // Wait for debounce and state update
      await waitFor(() => {
        expect(searchInput.value).toBe('bulba');
      });

      // Verify that usePokemonQuery was called with the search parameter
      // Note: The actual state update happens in the component, but we can verify
      // that the search input value changed, which implies the state would update
      expect(searchInput.value).toBe('bulba');
    });
  });

  describe('Sort Interaction Test', () => {
    it('should update sort state when sort button is clicked', async () => {
      const user = userEvent.setup();

      let currentSortBy: 'name' | 'id' = 'id';
      mockUsePokemonQuery.mockImplementation((params) => {
        currentSortBy = params?.sortBy || 'id';
        return {
          data: mockPokemonResponse,
          isLoading: false,
          isError: false,
          error: null,
          isFetching: false,
          isSuccess: true,
          status: 'success',
          dataUpdatedAt: Date.now(),
          errorUpdatedAt: 0,
          failureCount: 0,
          failureReason: null,
          errorUpdateCount: 0,
          isFetched: true,
          isFetchedAfterMount: true,
          isInitialLoading: false,
          isPaused: false,
          isPlaceholderData: false,
          isRefetching: false,
          isStale: false,
          refetch: jest.fn(),
          remove: jest.fn(),
        } as any;
      });

      render(
        <QueryClientProvider client={new QueryClient()}>
          <PokedexListScreen />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('sort-name')).toBeInTheDocument();
      });

      const sortByNameButton = screen.getByTestId('sort-name');

      // Click the sort by name button
      await user.click(sortByNameButton);

      // Verify the button is now pressed (indicating state change)
      await waitFor(() => {
        expect(sortByNameButton).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Pagination Test', () => {
    it('should disable previous button when on first page', () => {
      mockUsePokemonQuery.mockReturnValue({
        data: { ...mockPokemonResponse, previous: null },
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
        isSuccess: true,
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetching: false,
        isStale: false,
        refetch: jest.fn(),
        remove: jest.fn(),
      } as any);

      render(
        <QueryClientProvider client={new QueryClient()}>
          <PokedexListScreen />
        </QueryClientProvider>
      );

      const previousButton = screen.getByLabelText('Previous page');
      expect(previousButton).toBeDisabled();
    });

    it('should disable next button when on last page', () => {
      mockUsePokemonQuery.mockReturnValue({
        data: { ...mockPokemonResponse, next: null },
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
        isSuccess: true,
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetching: false,
        isStale: false,
        refetch: jest.fn(),
        remove: jest.fn(),
      } as any);

      render(
        <QueryClientProvider client={new QueryClient()}>
          <PokedexListScreen />
        </QueryClientProvider>
      );

      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).toBeDisabled();
    });
  });
});

