import { render } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  describe('Default Render Test', () => {
    it('should render the Search icon with default size (48px) and color (#1D1D1D)', () => {
      const { container } = render(<Icon name="search" />);

      // Find the SVG element
      const iconElement = container.querySelector('svg') as unknown as HTMLElement;

      expect(iconElement).toBeInTheDocument();

      // Check default size (48px)
      expect(iconElement).toHaveAttribute('width', '48');
      expect(iconElement).toHaveAttribute('height', '48');

      // Check default color (#1D1D1D)
      // SVG icons use fill attribute for filled icons
      const pathElement = iconElement?.querySelector('path') as unknown as HTMLElement;
      expect(pathElement).toBeInTheDocument();
      expect(pathElement).toHaveAttribute('fill', '#1D1D1D');
    });
  });

  describe('Custom Prop Test', () => {
    it('should apply custom size and color when provided', () => {
      const { container } = render(<Icon name="search" size={24} color="red" />);

      const iconElement = container.querySelector('svg') as unknown as HTMLElement;
      expect(iconElement).toBeInTheDocument();

      // Check custom size (24px)
      expect(iconElement).toHaveAttribute('width', '24');
      expect(iconElement).toHaveAttribute('height', '24');

      // Check custom color (red)
      // Check if color is applied to path elements
      const pathElements = iconElement?.querySelectorAll('path');
      if (pathElements && pathElements.length > 0) {
        // Check the first path element (most icons have at least one path)
        const firstPath = pathElements[0] as unknown as HTMLElement;
        expect(firstPath).toHaveAttribute('fill', 'red');
      }
    });

    it('should apply custom className when provided', () => {
      const { container } = render(<Icon name="search" className="custom-class hover:opacity-80" />);

      const iconElement = container.querySelector('svg') as unknown as HTMLElement;
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveClass('custom-class', 'hover:opacity-80');
    });
  });

  describe('Icon Name Mapping', () => {
    it('should render different icon types correctly', () => {
      const { container, rerender } = render(<Icon name="arrow_back" />);
      let iconElement = container.querySelector('svg') as unknown as HTMLElement;
      expect(iconElement).toBeInTheDocument();

      rerender(<Icon name="chevron_left" />);
      iconElement = container.querySelector('svg') as unknown as HTMLElement;
      expect(iconElement).toBeInTheDocument();

      rerender(<Icon name="close" />);
      iconElement = container.querySelector('svg') as unknown as HTMLElement;
      expect(iconElement).toBeInTheDocument();
    });
  });

  describe('Size Variations', () => {
    it('should handle different size values', () => {
      const { container, rerender } = render(<Icon name="search" size={16} />);
      let iconElement = container.querySelector('svg') as unknown as HTMLElement;
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveAttribute('width', '16');
      expect(iconElement).toHaveAttribute('height', '16');

      rerender(<Icon name="search" size={64} />);
      iconElement = container.querySelector('svg') as unknown as HTMLElement;
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveAttribute('width', '64');
      expect(iconElement).toHaveAttribute('height', '64');
    });
  });

  describe('Pokeball Icon', () => {
    it('should render pokeball icon with correct structure', () => {
      const { container } = render(<Icon name="pokeball" />);

      const iconElement = container.querySelector('svg') as unknown as HTMLElement;
      expect(iconElement).toBeInTheDocument();

      // Pokeball has circle and line elements
      const circles = iconElement?.querySelectorAll('circle');
      const lines = iconElement?.querySelectorAll('line');

      expect(circles?.length).toBeGreaterThan(0);
      expect(lines?.length).toBeGreaterThan(0);
    });
  });
});
