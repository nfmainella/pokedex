import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * GET /api/auth/status
 * Returns the authentication status of the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false });
    }

    try {
      // Verify the JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { username: string };

      return NextResponse.json({
        success: true,
        username: decoded.username,
      });
    } catch {
      // Token is invalid or expired
      return NextResponse.json({ success: false });
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

