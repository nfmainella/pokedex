import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

export interface AuthUser {
  username: string;
}

/**
 * Verifies authentication by validating the JWT token stored in cookies
 * Returns the user if authenticated, null otherwise
 */
export async function verifyAuth(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return null;
    }

    // Verify the JWT token using jose
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    );
    const decoded = await jwtVerify(authToken, secret);

    return { username: (decoded.payload as { username: string }).username };
  } catch (error) {
    // Token is invalid or expired
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

