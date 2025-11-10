'use client';

import { PokedexListScreen } from '@/screens/PokedexListScreen';

/**
 * Protected Page Client Component
 * 
 * Displays the Pokédex List Screen for authenticated users.
 * Responsive layout that adapts to different screen sizes.
 */
export default function ProtectedPageClient() {
  return (
    <div className="w-full min-h-screen bg-gray-100 font-sans">
      <PokedexListScreen />
    </div>
  );
}

