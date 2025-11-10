import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface AuthUser {
  username: string;
}

interface StatusResponse {
  success: boolean;
  user?: {
    username: string;
  };
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * Verifies authentication by proxying to the backend /api/status endpoint
 * Returns the user if authenticated, null otherwise
 * This uses the proxy approach - all auth logic stays in the backend
 */
export async function verifyAuth(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return null;
    }

    // Proxy the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/status`, {
      method: 'GET',
      headers: {
        Cookie: `auth_token=${authToken}`,
      },
      credentials: 'include',
      // Don't cache this request
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data: StatusResponse = await response.json();

    if (data.success && data.user) {
      return { username: data.user.username };
    }

    return null;
  } catch (error) {
    console.error('Error verifying auth:', error);
    return null;
  }
}

/**
 * Requires authentication - redirects to login if not authenticated
 * Use this in server components to protect routes
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await verifyAuth();

  if (!user) {
    redirect('/login');
  }

  return user;
}

