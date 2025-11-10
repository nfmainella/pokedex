import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * Proxy route for /api/logout
 * Forwards the request to the backend
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_URL}/api/logout`, {
      method: 'POST',
      headers: {
        Cookie: cookieHeader,
      },
      credentials: 'include',
    });

    const data = await response.json();

    // Create a new response with the backend's data
    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    // Forward any Set-Cookie headers from the backend (important for clearing auth_token)
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        nextResponse.headers.append('set-cookie', value);
      }
    });

    return nextResponse;
  } catch (error) {
    console.error('Error proxying logout request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

