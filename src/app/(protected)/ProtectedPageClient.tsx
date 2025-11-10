'use client';

import { PokedexListScreen } from '@/screens/PokedexListScreen';
import type { AuthUser } from '@/lib/auth';

interface ProtectedPageClientProps {
  user: AuthUser;
}

/**
 * Protected Page Client Component
 * 
 * Displays the Pokédex List Screen for authenticated users.
 * The layout matches the mobile-first design (360x640px) centered on the page.
 */
export default function ProtectedPageClient({ user }: ProtectedPageClientProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans">
      <div className="flex items-center justify-center p-4">
        <PokedexListScreen />
      </div>
    </div>
  );
}

