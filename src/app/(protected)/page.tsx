import { requireAuth } from '@/lib/auth';
import ProtectedPageClient from './ProtectedPageClient';

/**
 * Server Component - handles authentication check server-side
 * Uses proxy approach to verify auth with backend
 * requireAuth() will redirect to /login if not authenticated
 */
export default async function HomePage() {
  // Server-side auth check - redirects to login if not authenticated
  const user = await requireAuth();

  // Pass user data to client component
  return <ProtectedPageClient user={user} />;
}
