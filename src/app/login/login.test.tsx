/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './page';
import { useLoginMutation } from '@/hooks/useLoginMutation';
import React from 'react';

// Mock next/navigation before other imports
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the useLoginMutation hook
jest.mock('@/hooks/useLoginMutation');

const mockUseLoginMutation = useLoginMutation as jest.MockedFunction<
  typeof useLoginMutation
>;

describe('Login Page', () => {
  let queryClient: QueryClient;
  let mockMutateAsync: jest.Mock;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    mockMutateAsync = jest.fn();
    mockPush.mockClear();

    // Setup the mock for useLoginMutation
    mockUseLoginMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderLoginPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>
    );
  };

  it('should render login form with username and password fields', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should call useLoginMutation with admin/admin credentials when form is submitted', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({ message: 'Login successful' });

    renderLoginPage();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        username: 'admin',
        password: 'admin',
      });
    });
  });

  it('should show loading state when mutation is pending', () => {
    // Update mock to return isPending: true
    mockUseLoginMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any);

    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: /logging in/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Logging in...');
  });

  it('should handle successful login and redirect', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({ message: 'Login successful' });

    renderLoginPage();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        username: 'admin',
        password: 'admin',
      });
    });

    // Wait for navigation to be called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should display error message when login fails', async () => {
    const user = userEvent.setup();
    const errorResponse = {
      response: {
        data: {
          error: 'Invalid credentials',
        },
      },
    };
    mockMutateAsync.mockRejectedValue(errorResponse);

    renderLoginPage();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'wrong');
    await user.type(passwordInput, 'wrong');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});

