import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Next.js Middleware for API route protection
 * Verifies JWT token for protected Pokemon API routes
 * Uses jose library which is compatible with Edge Runtime
 */
export async function middleware(request: NextRequest) {
  // Only protect Pokemon API routes
  if (request.nextUrl.pathname.startsWith('/api/pokemon')) {
    // Get the token from cookies
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    try {
      // Verify the JWT token using jose (Edge Runtime compatible)
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key'
      );
      await jwtVerify(token, secret);
      // Token is valid, continue to the next middleware/route
      return NextResponse.next();
    } catch (error) {
      console.error('JWT verification failed:', error instanceof Error ? error.message : error);
      return NextResponse.json(
        { error: 'Forbidden: Invalid or expired token' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/pokemon/:path*'],
};
