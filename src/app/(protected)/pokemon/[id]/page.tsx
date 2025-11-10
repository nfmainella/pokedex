import { requireAuth } from '@/lib/auth';
import { PokemonDetailScreen } from '@/screens/PokemonDetailScreen';

/**
 * Pokémon Detail Page
 *
 * Displays detailed information about a specific Pokémon.
 * The page is protected and requires authentication via server-side auth check.
 *
 * Route Protection:
 * - Server-side: Uses requireAuth() to verify authentication and redirect to /login if needed
 * - Client-side: PokemonDetailScreen also implements redirect logic as a fallback
 */
export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Server-side auth check - redirects to login if not authenticated
  await requireAuth();

  // Parse ID - can be number or name
  const { id } = await params;
  if (!id) {
    return <div>No ID provided</div>;
  }

  return (
    <div className="w-full h-screen bg-gray-100 font-sans overflow-hidden">
      <PokemonDetailScreen id={id} />
    </div>
  );
}

