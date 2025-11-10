import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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
 * Verifies JWT token from NextRequest (for API routes)
 * Returns true if token is valid, false otherwise
 */
export async function verifyAuthFromRequest(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return false;
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    );
    await jwtVerify(token, secret);

    return true;
  } catch (error) {
    console.error('JWT verification failed:', error instanceof Error ? error.message : error);
    return false;
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

/**
 * Middleware for protecting API routes
 * Returns an error response if authentication fails, null if successful
 * Use this in API route handlers
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const authError = await requireApiAuth(request);
 *   if (authError) return authError;
 *
 *   // Your protected route logic here
 * }
 * ```
 */
export async function requireApiAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  const isAuthenticated = await verifyAuthFromRequest(request);

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized: No valid token provided' },
      { status: 401 }
    );
  }

  return null;
}

