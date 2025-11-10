import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clears the authentication token cookie
 */
export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logout successful' });

    // Clear the auth token cookie
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediate expiration
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

