import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

/**
 * POST /api/auth/login
 * Authenticates user with credentials and returns a JWT token
 *
 * Body:
 * - username: string
 * - password: string
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = (await request.json()) as {
      username?: string;
      password?: string;
    };

    // Validate credentials (hardcoded for this exercise: admin/admin)
    if (username === 'admin' && password === 'admin') {
      // Generate JWT token using jose
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key'
      );
      const token = await new SignJWT({ username: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(secret);

      // Create response
      const response = NextResponse.json({ message: 'Login successful' });

      // Set auth token cookie
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60, // 24 hours in seconds
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

