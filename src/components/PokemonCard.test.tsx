import { render, screen } from '@testing-library/react';
import { PokemonCard } from './PokemonCard';
import type { PokemonCardProps } from './PokemonCard';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    width,
    height,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} />;
  };
});

describe('PokemonCard', () => {
  const mockPokemon: PokemonCardProps['pokemon'] = {
    id: 1,
    name: 'bulbasaur',
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    },
    types: [
      { name: 'grass' },
      { name: 'poison' },
    ],
  };

  it('should render the Pokémon name, number, and image', () => {
    render(<PokemonCard pokemon={mockPokemon} />);

    // Check name is rendered and capitalized
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument();

    // Check ID/number is rendered with proper formatting
    expect(screen.getByText('#001')).toBeInTheDocument();

    // Check image is rendered with correct src and alt
    const image = screen.getByAltText('Bulbasaur');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockPokemon.sprites.front_default);
  });

  it('should wrap the card in a link that points to the correct detail URL', () => {
    render(<PokemonCard pokemon={mockPokemon} />);

    // Find the link element
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/pokemon/1');
  });

  it('should render and style type badges correctly', () => {
    render(<PokemonCard pokemon={mockPokemon} />);

    // Check that both type badges are rendered
    const grassBadge = screen.getByText('Grass');
    const poisonBadge = screen.getByText('Poison');

    expect(grassBadge).toBeInTheDocument();
    expect(poisonBadge).toBeInTheDocument();

    // Check that badges have the correct styling classes
    expect(grassBadge).toHaveClass('rounded-full', 'text-xs', 'font-medium', 'text-white');
    expect(poisonBadge).toHaveClass('rounded-full', 'text-xs', 'font-medium', 'text-white');

    // Check that badges have inline styles with correct background colors
    expect(grassBadge).toHaveStyle({ backgroundColor: '#8DD694' });
    expect(poisonBadge).toHaveStyle({ backgroundColor: '#A552CC' });
  });

  it('should format single-digit IDs correctly', () => {
    const singleDigitPokemon: PokemonCardProps['pokemon'] = {
      ...mockPokemon,
      id: 5,
    };

    render(<PokemonCard pokemon={singleDigitPokemon} />);
    expect(screen.getByText('#005')).toBeInTheDocument();
  });

  it('should format multi-digit IDs correctly', () => {
    const multiDigitPokemon: PokemonCardProps['pokemon'] = {
      ...mockPokemon,
      id: 150,
    };

    render(<PokemonCard pokemon={multiDigitPokemon} />);
    expect(screen.getByText('#150')).toBeInTheDocument();
  });

  it('should handle Pokémon with a single type', () => {
    const singleTypePokemon: PokemonCardProps['pokemon'] = {
      ...mockPokemon,
      types: [{ name: 'fire' }],
    };

    render(<PokemonCard pokemon={singleTypePokemon} />);

    const fireBadge = screen.getByText('Fire');
    expect(fireBadge).toBeInTheDocument();
    expect(fireBadge).toHaveStyle({ backgroundColor: '#FF6600' });
  });

  it('should handle unknown type colors by defaulting to normal', () => {
    const unknownTypePokemon: PokemonCardProps['pokemon'] = {
      ...mockPokemon,
      types: [{ name: 'unknown-type' }],
    };

    render(<PokemonCard pokemon={unknownTypePokemon} />);

    const badge = screen.getByText('Unknown-type');
    expect(badge).toBeInTheDocument();
    // Should default to normal type color
    expect(badge).toHaveStyle({ backgroundColor: '#AA9999' });
  });
});

