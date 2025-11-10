/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyAuth, requireAuth } from './auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock jose
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

// Import the mocked jwtVerify
import { jwtVerify as mockJwtVerify } from 'jose';
const mockVerify = mockJwtVerify as jest.MockedFunction<typeof mockJwtVerify>;

describe('auth utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('verifyAuth', () => {
    it('should return null when no auth token cookie exists', async () => {
      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
      } as any);

      const result = await verifyAuth();

      expect(result).toBeNull();
      expect(mockVerify).not.toHaveBeenCalled();
    });

    it('should return user when token is valid', async () => {
      const mockToken = 'valid-token';
      mockCookies.mockResolvedValue({
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      } as any);

      mockVerify.mockResolvedValue({ payload: { username: 'admin' } } as any);

      const result = await verifyAuth();

      expect(result).toEqual({ username: 'admin' });
      expect(mockVerify).toHaveBeenCalled();
    });

    it('should return null when token verification fails', async () => {
      const mockToken = 'invalid-token';
      mockCookies.mockResolvedValue({
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      } as any);

      mockVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await verifyAuth();

      expect(result).toBeNull();
    });

    it('should return null when token is expired', async () => {
      const mockToken = 'expired-token';
      mockCookies.mockResolvedValue({
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      } as any);

      mockVerify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      const result = await verifyAuth();

      expect(result).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockToken = 'valid-token';
      mockCookies.mockResolvedValue({
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      } as any);

      mockVerify.mockResolvedValue({ payload: { username: 'admin' } } as any);

      const result = await requireAuth();

      expect(result).toEqual({ username: 'admin' });
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect to login when not authenticated', async () => {
      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
      } as any);

      await requireAuth();

      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('should redirect to login when token verification fails', async () => {
      const mockToken = 'invalid-token';
      mockCookies.mockResolvedValue({
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      } as any);

      mockVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await requireAuth();

      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });
});

