import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * Proxy route for /api/pokemon
 * Forwards the request to the backend with cookies and query parameters
 */
export async function GET(request: NextRequest) {
  try {
    // Get all cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';

    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy');

    // Build query string for backend
    const queryParams = new URLSearchParams();
    if (limit) queryParams.set('limit', limit);
    if (offset) queryParams.set('offset', offset);
    if (search) queryParams.set('search', search);
    if (sortBy) queryParams.set('sortBy', sortBy);

    const queryString = queryParams.toString();
    const backendUrl = `${BACKEND_URL}/api/pokemon${queryString ? `?${queryString}` : ''}`;

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
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
    console.error('Error proxying pokemon request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

