import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('GET /api/auth/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BACKEND_URL = 'http://localhost:3001';
  });

  afterEach(() => {
    delete process.env.BACKEND_URL;
  });

  it('should proxy request to backend and return success response', async () => {
    const mockRequest = {
      nextUrl: { pathname: '/api/auth/status' },
      headers: {
        get: jest.fn((name: string) => {
          if (name === 'cookie') {
            return 'auth_token=test-token';
          }
          return null;
        }),
      },
    } as unknown as NextRequest;

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        user: { username: 'admin' },
      }),
      headers: new Headers(),
    } as Response);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/status',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Cookie: 'auth_token=test-token',
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      user: { username: 'admin' },
    });
  });

  it('should forward Set-Cookie headers from backend', async () => {
    const mockRequest = {
      nextUrl: { pathname: '/api/auth/status' },
      headers: {
        get: jest.fn(() => 'auth_token=test-token'),
      },
    } as unknown as NextRequest;

    const backendHeaders = new Headers();
    backendHeaders.set('set-cookie', 'auth_token=new-token; HttpOnly');

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, user: { username: 'admin' } }),
      headers: backendHeaders,
    } as Response);

    const response = await GET(mockRequest);

    expect(response.headers.get('set-cookie')).toBe('auth_token=new-token; HttpOnly');
  });

  it('should return 401 when backend returns 401', async () => {
    const mockRequest = {
      nextUrl: { pathname: '/api/auth/status' },
      headers: {
        get: jest.fn(() => ''),
      },
    } as unknown as NextRequest;

    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized: No token provided' }),
      headers: new Headers(),
    } as Response);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized: No token provided' });
  });

  it('should return 500 when backend request fails', async () => {
    const mockRequest = {
      nextUrl: { pathname: '/api/auth/status' },
      headers: {
        get: jest.fn(() => 'auth_token=test-token'),
      },
    } as unknown as NextRequest;

    mockFetch.mockRejectedValue(new Error('Network error'));

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});

