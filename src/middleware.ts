import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Next.js Middleware for API route protection
 * Verifies JWT token for protected Pokemon API routes
 */
export function middleware(request: NextRequest) {
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
      // Verify the JWT token
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      // Token is valid, continue to the next middleware/route
      return NextResponse.next();
    } catch {
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
