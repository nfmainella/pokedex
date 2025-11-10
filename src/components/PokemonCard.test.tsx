import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PokemonCard } from './PokemonCard';
import type { PokemonCardProps } from './PokemonCard';
import React from 'react';

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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
};

describe('PokemonCard', () => {
  const mockPokemon: PokemonCardProps['pokemon'] = {
    id: 1,
    name: 'bulbasaur',
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    },
  };

  it('should render the Pokémon name, number, and image', () => {
    render(<PokemonCard pokemon={mockPokemon} />, { wrapper: createWrapper() });

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
    render(<PokemonCard pokemon={mockPokemon} />, { wrapper: createWrapper() });

    // Find the link element
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/pokemon/1');
  });

  it('should format single-digit IDs correctly', () => {
    const singleDigitPokemon: PokemonCardProps['pokemon'] = {
      ...mockPokemon,
      id: 5,
    };

    render(<PokemonCard pokemon={singleDigitPokemon} />, { wrapper: createWrapper() });
    expect(screen.getByText('#005')).toBeInTheDocument();
  });

  it('should format multi-digit IDs correctly', () => {
    const multiDigitPokemon: PokemonCardProps['pokemon'] = {
      ...mockPokemon,
      id: 150,
    };

    render(<PokemonCard pokemon={multiDigitPokemon} />, { wrapper: createWrapper() });
    expect(screen.getByText('#150')).toBeInTheDocument();
  });
});

