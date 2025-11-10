import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * Proxy route for /api/status
 * Forwards the request to the backend with cookies
 */
export async function GET(request: NextRequest) {
  try {
    // Get all cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/status`, {
      method: 'GET',
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

    // Forward any Set-Cookie headers from the backend
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        nextResponse.headers.append('set-cookie', value);
      }
    });

    return nextResponse;
  } catch (error) {
    console.error('Error proxying status request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

