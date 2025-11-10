import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface AuthUser {
  username: string;
}

/**
 * Verifies the JWT token from cookies and returns the decoded user
 * Returns null if token is invalid or missing
 */
export async function verifyAuth(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not set');
      return null;
    }

    const decoded = jwt.verify(token, secret) as { username: string };
    return { username: decoded.username };
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

