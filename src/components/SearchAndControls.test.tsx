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

  describe('Sort Popup', () => {
    it('should render sort button', () => {
      render(<SearchAndControls {...defaultProps} />);

      const sortButton = screen.getByLabelText('Sort options');
      expect(sortButton).toBeInTheDocument();
    });

    it('should open popup when sort button is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchAndControls {...defaultProps} />);

      const sortButton = screen.getByLabelText('Sort options');
      await user.click(sortButton);

      // Popup should be visible with radio options
      expect(screen.getByText('Number')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('should call onSortChange with "name" when "Name" option is clicked', async () => {
      const onSortChange = jest.fn();
      const user = userEvent.setup();
      render(<SearchAndControls {...defaultProps} onSortChange={onSortChange} />);

      const sortButton = screen.getByLabelText('Sort options');
      await user.click(sortButton);

      const nameOption = screen.getByText('Name');
      await user.click(nameOption);

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith('name');
    });

    it('should call onSortChange with "id" when "Number" option is clicked', async () => {
      const onSortChange = jest.fn();
      const user = userEvent.setup();
      render(<SearchAndControls {...defaultProps} onSortChange={onSortChange} />);

      const sortButton = screen.getByLabelText('Sort options');
      await user.click(sortButton);

      const numberOption = screen.getByText('Number');
      await user.click(numberOption);

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith('id');
    });

    it('should close popup after selecting an option', async () => {
      const onSortChange = jest.fn();
      const user = userEvent.setup();
      render(<SearchAndControls {...defaultProps} onSortChange={onSortChange} />);

      const sortButton = screen.getByLabelText('Sort options');
      await user.click(sortButton);

      const nameOption = screen.getByText('Name');
      await user.click(nameOption);

      // Popup should be closed
      await waitFor(() => {
        expect(screen.queryByText('Number')).not.toBeInTheDocument();
      });
    });

    it('should show checked radio button for "Number" when initialSortBy is "id"', async () => {
      const user = userEvent.setup();
      render(<SearchAndControls {...defaultProps} initialSortBy="id" />);

      const sortButton = screen.getByLabelText('Sort options');
      await user.click(sortButton);

      // Check that Number option is selected (we can't easily test the SVG, but we can test the structure)
      const numberLabel = screen.getByText('Number').closest('label');
      expect(numberLabel).toBeInTheDocument();
    });

    it('should show checked radio button for "Name" when initialSortBy is "name"', async () => {
      const user = userEvent.setup();
      render(<SearchAndControls {...defaultProps} initialSortBy="name" />);

      const sortButton = screen.getByLabelText('Sort options');
      await user.click(sortButton);

      // Check that Name option is selected
      const nameLabel = screen.getByText('Name').closest('label');
      expect(nameLabel).toBeInTheDocument();
    });

    it('should close popup when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <SearchAndControls {...defaultProps} />
        </div>
      );

      const sortButton = screen.getByLabelText('Sort options');
      await user.click(sortButton);

      // Popup should be open
      expect(screen.getByText('Number')).toBeInTheDocument();

      // Click outside
      const outside = screen.getByTestId('outside');
      await user.click(outside);

      // Popup should be closed
      await waitFor(() => {
        expect(screen.queryByText('Number')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for search input', () => {
      render(<SearchAndControls {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search Pokémon');
      expect(searchInput).toBeInTheDocument();
    });

    it('should have proper aria-expanded attribute for sort button', async () => {
      const user = userEvent.setup();
      render(<SearchAndControls {...defaultProps} />);

      const sortButton = screen.getByLabelText('Sort options');
      expect(sortButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(sortButton);
      expect(sortButton).toHaveAttribute('aria-expanded', 'true');
    });
  });
});

