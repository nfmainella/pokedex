import { requireAuth } from '@/lib/auth';
import HomePage from './page';
import ProtectedPageClient from './ProtectedPageClient';

// Mock the auth utility
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

// Mock the client component
jest.mock('./ProtectedPageClient', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Protected Page Client</div>),
}));

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;


describe('Protected Page (Server Component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call requireAuth and render ProtectedPageClient when authenticated', async () => {
    const mockUser = { username: 'admin' };
    mockRequireAuth.mockResolvedValue(mockUser);

    const result = await HomePage();

    expect(mockRequireAuth).toHaveBeenCalled();
    // The result should be a React element
    expect(result).toBeDefined();
  });

  it('should redirect when requireAuth returns null (handled by requireAuth)', async () => {
    // requireAuth will call redirect() internally, which throws
    mockRequireAuth.mockImplementation(async () => {
      const { redirect } = await import('next/navigation');
      redirect('/login');
      // This line won't execute, but TypeScript needs it
      return { username: 'admin' };
    });

    // Since redirect throws, we expect an error
    await expect(HomePage()).rejects.toThrow();
    expect(mockRequireAuth).toHaveBeenCalled();
  });
});

