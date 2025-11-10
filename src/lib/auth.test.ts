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

// Mock fetch
global.fetch = jest.fn();

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('auth utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BACKEND_URL = 'http://localhost:3001';
  });

  afterEach(() => {
    delete process.env.BACKEND_URL;
  });

  describe('verifyAuth', () => {
    it('should return null when no auth token cookie exists', async () => {
      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
      } as any);

      const result = await verifyAuth();

      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
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

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: { username: 'admin' },
        }),
      } as Response);

      const result = await verifyAuth();

      expect(result).toEqual({ username: 'admin' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/status',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Cookie: `auth_token=${mockToken}`,
          }),
        })
      );
    });

    it('should return null when backend returns error', async () => {
      const mockToken = 'invalid-token';
      mockCookies.mockResolvedValue({
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      } as any);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      const result = await verifyAuth();

      expect(result).toBeNull();
    });

    it('should return null when backend returns success: false', async () => {
      const mockToken = 'token';
      mockCookies.mockResolvedValue({
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      } as any);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
        }),
      } as Response);

      const result = await verifyAuth();

      expect(result).toBeNull();
    });

    it('should return null when fetch throws an error', async () => {
      const mockToken = 'token';
      mockCookies.mockResolvedValue({
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      } as any);

      mockFetch.mockRejectedValue(new Error('Network error'));

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

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: { username: 'admin' },
        }),
      } as Response);

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

    it('should redirect to login when backend returns error', async () => {
      const mockToken = 'invalid-token';
      mockCookies.mockResolvedValue({
        get: jest.fn((name: string) => {
          if (name === 'auth_token') {
            return { value: mockToken };
          }
          return undefined;
        }),
      } as any);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      await requireAuth();

      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });
});

