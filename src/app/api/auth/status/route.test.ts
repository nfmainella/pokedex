/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock jose
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

import { jwtVerify as mockJwtVerify } from 'jose';
const mockVerify = mockJwtVerify as jest.MockedFunction<typeof mockJwtVerify>;

describe('GET /api/auth/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should return success with username when token is valid', async () => {
    const mockToken = 'valid-token';
    const mockRequest = {
      cookies: {
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      },
    } as unknown as NextRequest;

    mockVerify.mockResolvedValue({ payload: { username: 'admin' } } as any);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(mockVerify).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      username: 'admin',
    });
  });

  it('should return success false when no token exists', async () => {
    const mockRequest = {
      cookies: {
        get: jest.fn().mockReturnValue(undefined),
      },
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: false });
  });

  it('should return success false when token verification fails', async () => {
    const mockToken = 'invalid-token';
    const mockRequest = {
      cookies: {
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      },
    } as unknown as NextRequest;

    mockVerify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: false });
  });

  it('should return success false when token is expired', async () => {
    const mockToken = 'expired-token';
    const mockRequest = {
      cookies: {
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      },
    } as unknown as NextRequest;

    mockVerify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: false });
  });

  it('should return 500 on internal error', async () => {
    const mockRequest = {
      cookies: {
        get: jest.fn(() => {
          throw new Error('Unexpected error');
        }),
      },
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});

