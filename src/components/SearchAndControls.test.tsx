import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchAndControls } from './SearchAndControls';
import type { SearchAndControlsProps } from './SearchAndControls';

describe('SearchAndControls', () => {
  const defaultProps: SearchAndControlsProps = {
    initialSearch: '',
    onSearchChange: jest.fn(),
    initialSortBy: 'id',
    onSortChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Input', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should render the search input with placeholder', () => {
      render(<SearchAndControls {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('should display the initial search value', () => {
      render(<SearchAndControls {...defaultProps} initialSearch="pikachu" />);

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('pikachu');
    });

    it('should update the input value immediately when typing', async () => {
      const user = userEvent.setup({ delay: null });
      render(<SearchAndControls {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search');
      await user.type(searchInput, 'charizard');

      expect(searchInput).toHaveValue('charizard');
    });

    it('should NOT call onSearchChange immediately when typing', async () => {
      const onSearchChange = jest.fn();
      const user = userEvent.setup({ delay: null });
      render(<SearchAndControls {...defaultProps} onSearchChange={onSearchChange} />);

      const searchInput = screen.getByPlaceholderText('Search');
      await user.type(searchInput, 'pikachu');

      // Should not be called immediately
      expect(onSearchChange).not.toHaveBeenCalled();
    });

    it('should call onSearchChange exactly once after 300ms debounce', async () => {
      const onSearchChange = jest.fn();
      const user = userEvent.setup({ delay: null });
      render(<SearchAndControls {...defaultProps} onSearchChange={onSearchChange} />);

      const searchInput = screen.getByPlaceholderText('Search');
      await user.type(searchInput, 'pikachu');

      // Fast-forward 300ms
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onSearchChange).toHaveBeenCalledTimes(1);
        expect(onSearchChange).toHaveBeenCalledWith('pikachu');
      });
    });

    it('should debounce multiple rapid keystrokes and only call onSearchChange once', async () => {
      const onSearchChange = jest.fn();
      const user = userEvent.setup({ delay: null });
      render(<SearchAndControls {...defaultProps} onSearchChange={onSearchChange} />);

      const searchInput = screen.getByPlaceholderText('Search');
      
      // Type multiple characters rapidly
      await user.type(searchInput, 'p');
      jest.advanceTimersByTime(100);
      await user.type(searchInput, 'i');
      jest.advanceTimersByTime(100);
      await user.type(searchInput, 'k');
      jest.advanceTimersByTime(100);

      // Should not be called yet (only 300ms total elapsed)
      expect(onSearchChange).not.toHaveBeenCalled();

      // Fast-forward remaining time to complete 300ms from last keystroke
      jest.advanceTimersByTime(200);

      await waitFor(() => {
        expect(onSearchChange).toHaveBeenCalledTimes(1);
        expect(onSearchChange).toHaveBeenCalledWith('pik');
      });
    });

    it('should reset debounce timer when user continues typing', async () => {
      const onSearchChange = jest.fn();
      const user = userEvent.setup({ delay: null });
      render(<SearchAndControls {...defaultProps} onSearchChange={onSearchChange} />);

      const searchInput = screen.getByPlaceholderText('Search');
      
      await user.type(searchInput, 'p');
      jest.advanceTimersByTime(250); // Almost at 300ms
      
      await user.type(searchInput, 'i'); // Reset timer
      jest.advanceTimersByTime(250); // Almost at 300ms again
      
      await user.type(searchInput, 'k'); // Reset timer again
      jest.advanceTimersByTime(300); // Complete 300ms from last keystroke

      await waitFor(() => {
        expect(onSearchChange).toHaveBeenCalledTimes(1);
        expect(onSearchChange).toHaveBeenCalledWith('pik');
      });
    });

    it('should sync with external initialSearch changes', () => {
      const { rerender } = render(<SearchAndControls {...defaultProps} initialSearch="" />);

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('');

      rerender(<SearchAndControls {...defaultProps} initialSearch="bulbasaur" />);
      expect(searchInput).toHaveValue('bulbasaur');
    });
  });

  describe('Clear Button', () => {
    it('should not render clear button when search input is empty', () => {
      render(<SearchAndControls {...defaultProps} initialSearch="" />);

      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should render clear button when search input has value', () => {
      render(<SearchAndControls {...defaultProps} initialSearch="pikachu" />);

      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear search input and immediately call onSearchChange when clear button is clicked', async () => {
      const onSearchChange = jest.fn();
      const user = userEvent.setup();
      render(<SearchAndControls {...defaultProps} initialSearch="pikachu" onSearchChange={onSearchChange} />);

      const searchInput = screen.getByPlaceholderText('Search');
      const clearButton = screen.getByLabelText('Clear search');

      // Verify initial state
      expect(searchInput).toHaveValue('pikachu');

      // Click clear button
      await user.click(clearButton);

      // Input should be cleared immediately
      expect(searchInput).toHaveValue('');

      // onSearchChange should be called immediately with empty string (no debounce)
      expect(onSearchChange).toHaveBeenCalledTimes(1);
      expect(onSearchChange).toHaveBeenCalledWith('');

      // Clear button should no longer be visible
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    });

    it('should cancel pending debounce timer when clear button is clicked', async () => {
      const onSearchChange = jest.fn();
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      render(<SearchAndControls {...defaultProps} onSearchChange={onSearchChange} />);

      const searchInput = screen.getByPlaceholderText('Search');
      
      // Type some text
      await user.type(searchInput, 'char');
      
      // Verify debounce hasn't fired yet
      expect(onSearchChange).not.toHaveBeenCalled();

      // Click clear button before debounce completes
      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      // Fast-forward past the debounce time
      jest.advanceTimersByTime(300);

      // onSearchChange should only have been called once (from clear button)
      // and not from the debounced typing
      expect(onSearchChange).toHaveBeenCalledTimes(1);
      expect(onSearchChange).toHaveBeenCalledWith('');

      jest.useRealTimers();
    });
  });

  describe('Sort Buttons', () => {
    it('should render both sort buttons', () => {
      render(<SearchAndControls {...defaultProps} />);

      expect(screen.getByLabelText('Sort by Name (A-Z)')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by ID (#)')).toBeInTheDocument();
    });

    it('should call onSortChange with "name" when "Sort by Name" button is clicked', async () => {
      const onSortChange = jest.fn();
      const user = userEvent.setup();
      render(<SearchAndControls {...defaultProps} onSortChange={onSortChange} />);

      const sortByNameButton = screen.getByLabelText('Sort by Name (A-Z)');
      await user.click(sortByNameButton);

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith('name');
    });

    it('should call onSortChange with "id" when "Sort by ID" button is clicked', async () => {
      const onSortChange = jest.fn();
      const user = userEvent.setup();
      render(<SearchAndControls {...defaultProps} onSortChange={onSortChange} />);

      const sortByIdButton = screen.getByLabelText('Sort by ID (#)');
      await user.click(sortByIdButton);

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith('id');
    });

    it('should apply active styling to "Sort by Name" button when initialSortBy is "name"', () => {
      render(<SearchAndControls {...defaultProps} initialSortBy="name" />);

      const sortByNameButton = screen.getByLabelText('Sort by Name (A-Z)');
      const sortByIdButton = screen.getByLabelText('Sort by ID (#)');

      // Active button should have red background and white text
      expect(sortByNameButton).toHaveClass('bg-primary', 'text-white');
      expect(sortByNameButton).toHaveAttribute('aria-pressed', 'true');

      // Inactive button should have white background and red text
      expect(sortByIdButton).toHaveClass('bg-white', 'text-primary');
      expect(sortByIdButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should apply active styling to "Sort by ID" button when initialSortBy is "id"', () => {
      render(<SearchAndControls {...defaultProps} initialSortBy="id" />);

      const sortByNameButton = screen.getByLabelText('Sort by Name (A-Z)');
      const sortByIdButton = screen.getByLabelText('Sort by ID (#)');

      // Active button should have red background and white text
      expect(sortByIdButton).toHaveClass('bg-primary', 'text-white');
      expect(sortByIdButton).toHaveAttribute('aria-pressed', 'true');

      // Inactive button should have white background and red text
      expect(sortByNameButton).toHaveClass('bg-white', 'text-primary');
      expect(sortByNameButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should update active styling when initialSortBy prop changes', () => {
      const { rerender } = render(<SearchAndControls {...defaultProps} initialSortBy="id" />);

      let sortByNameButton = screen.getByLabelText('Sort by Name (A-Z)');
      let sortByIdButton = screen.getByLabelText('Sort by ID (#)');

      expect(sortByIdButton).toHaveClass('bg-primary', 'text-white');
      expect(sortByNameButton).toHaveClass('bg-white', 'text-primary');

      rerender(<SearchAndControls {...defaultProps} initialSortBy="name" />);

      sortByNameButton = screen.getByLabelText('Sort by Name (A-Z)');
      sortByIdButton = screen.getByLabelText('Sort by ID (#)');

      expect(sortByNameButton).toHaveClass('bg-primary', 'text-white');
      expect(sortByIdButton).toHaveClass('bg-white', 'text-primary');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for search input', () => {
      render(<SearchAndControls {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search Pokémon');
      expect(searchInput).toBeInTheDocument();
    });

    it('should have proper aria-pressed attributes for sort buttons', () => {
      render(<SearchAndControls {...defaultProps} initialSortBy="name" />);

      expect(screen.getByLabelText('Sort by Name (A-Z)')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByLabelText('Sort by ID (#)')).toHaveAttribute('aria-pressed', 'false');
    });
  });
});

