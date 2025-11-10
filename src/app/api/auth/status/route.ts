import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

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
      // Verify the JWT token using jose
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key'
      );
      const decoded = await jwtVerify(token, secret);

      return NextResponse.json({
        success: true,
        username: (decoded.payload as { username: string }).username,
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

