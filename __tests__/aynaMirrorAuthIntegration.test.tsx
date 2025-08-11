// AYNA Mirror Authentication Integration Tests
import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/theme/ThemeProvider';
import AynaMirrorPage from '@/../app/(app)/ayna-mirror';
import AynaMirrorSettingsPage from '@/../app/ayna-mirror-settings';
import { supabase } from '@/config/supabaseClient';
const { mockAuth } = require('../__mocks__/supabaseClient');

// Mock Supabase is handled by the shared mock file

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
  Redirect: ({ href }: { href: string }) => (
    <div data-testid="redirect" data-href={href}>
      Redirecting to {href}
    </div>
  ),
}));

// Mock AYNA Mirror screens
jest.mock('@/screens/AynaMirrorScreen', () => ({
  AynaMirrorScreen: ({ userId }: { userId: string }) => (
    <div data-testid="ayna-mirror-screen" data-user-id={userId}>
      AYNA Mirror for user: {userId}
    </div>
  ),
}));

jest.mock('@/screens/AynaMirrorSettingsScreen', () => ({
  __esModule: true,
  default: ({ navigation }: { navigation: any }) => (
    <div data-testid="ayna-mirror-settings-screen">
      AYNA Mirror Settings
    </div>
  ),
}));

// Mock services
jest.mock('@/services/notificationHandler', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    cleanup: jest.fn(),
    isReady: jest.fn(() => true),
  },
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ThemeProvider>
);

describe('AYNA Mirror Authentication Integration', () => {
  // Use the mockAuth from the shared mock

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authenticated User Flow', () => {
    beforeEach(() => {
      // Mock authenticated session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'authenticated-user-123',
              email: 'test@example.com',
            },
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
          },
        },
        error: null,
      } as any);

      // Mock auth state change listener
      mockAuth.onAuthStateChange.mockImplementation((callback: any) => {
        // Simulate authenticated state
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: 'authenticated-user-123',
              email: 'test@example.com',
            },
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
          } as any);
        }, 0);

        return {
          data: { subscription: { unsubscribe: jest.fn() } }
        };
      });
    });

    it('should render AYNA Mirror screen for authenticated user', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <AynaMirrorPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const aynaMirrorScreen = getByTestId('ayna-mirror-screen');
        expect(aynaMirrorScreen).toBeTruthy();
        expect(aynaMirrorScreen.props['data-user-id']).toBe('authenticated-user-123');
      });
    });

    it('should render AYNA Mirror settings for authenticated user', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <AynaMirrorSettingsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const settingsScreen = getByTestId('ayna-mirror-settings-screen');
        expect(settingsScreen).toBeTruthy();
      });
    });

    it('should pass correct user ID to AYNA Mirror screen', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <AynaMirrorPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const aynaMirrorScreen = getByTestId('ayna-mirror-screen');
        expect(aynaMirrorScreen.props['data-user-id']).toBe('authenticated-user-123');
      });
    });
  });

  describe('Unauthenticated User Flow', () => {
    beforeEach(() => {
      // Mock no session
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      // Mock auth state change listener for unauthenticated state
      mockAuth.onAuthStateChange.mockImplementation((callback: any) => {
        setTimeout(() => {
          callback('SIGNED_OUT', null);
        }, 0);

        return {
          data: { subscription: { unsubscribe: jest.fn() } }
        };
      });
    });

    it('should redirect to sign-in when user is not authenticated', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <AynaMirrorPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const redirect = getByTestId('redirect');
        expect(redirect).toBeTruthy();
        expect(redirect.props['data-href']).toBe('/auth/sign-in');
      });
    });

    it('should redirect settings page to sign-in when user is not authenticated', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <AynaMirrorSettingsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const redirect = getByTestId('redirect');
        expect(redirect).toBeTruthy();
        expect(redirect.props['data-href']).toBe('/auth/sign-in');
      });
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      // Mock loading state - session call takes time
      mockAuth.getSession.mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: { session: null },
              error: null,
            } as any);
          }, 1000);
        })
      );
    });

    it('should show loading state while authentication is being determined', async () => {
      const { queryByTestId } = render(
        <TestWrapper>
          <AynaMirrorPage />
        </TestWrapper>
      );

      // Should not show redirect immediately while loading
      expect(queryByTestId('redirect')).toBeNull();
      expect(queryByTestId('ayna-mirror-screen')).toBeNull();

      // After loading completes, should redirect
      await waitFor(() => {
        expect(queryByTestId('redirect')).toBeTruthy();
      }, { timeout: 2000 });
    });
  });

  describe('Authentication State Changes', () => {
    it('should handle sign-in during app usage', async () => {
      let authCallback: any;

      // Start with unauthenticated state
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      mockAuth.onAuthStateChange.mockImplementation((callback: any) => {
        authCallback = callback;
        return {
          data: { subscription: { unsubscribe: jest.fn() } }
        };
      });

      const { getByTestId, rerender } = render(
        <TestWrapper>
          <AynaMirrorPage />
        </TestWrapper>
      );

      // Should initially redirect to sign-in
      await waitFor(() => {
        expect(getByTestId('redirect').props['data-href']).toBe('/auth/sign-in');
      });

      // Simulate user signing in
      act(() => {
        authCallback('SIGNED_IN', {
          user: {
            id: 'newly-signed-in-user',
            email: 'newuser@example.com',
          },
          access_token: 'new-token',
          refresh_token: 'new-refresh-token',
        });
      });

      // Re-render to reflect auth state change
      rerender(
        <TestWrapper>
          <AynaMirrorPage />
        </TestWrapper>
      );

      // Should now show AYNA Mirror screen
      await waitFor(() => {
        const aynaMirrorScreen = getByTestId('ayna-mirror-screen');
        expect(aynaMirrorScreen).toBeTruthy();
        expect(aynaMirrorScreen.props['data-user-id']).toBe('newly-signed-in-user');
      });
    });

    it('should handle sign-out during app usage', async () => {
      let authCallback: any;

      // Start with authenticated state
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'signed-in-user',
              email: 'user@example.com',
            },
            access_token: 'token',
            refresh_token: 'refresh-token',
          },
        },
        error: null,
      } as any);

      mockAuth.onAuthStateChange.mockImplementation((callback: any) => {
        authCallback = callback;
        return {
          data: { subscription: { unsubscribe: jest.fn() } }
        };
      });

      const { getByTestId, rerender } = render(
        <TestWrapper>
          <AynaMirrorPage />
        </TestWrapper>
      );

      // Should initially show AYNA Mirror screen
      await waitFor(() => {
        const aynaMirrorScreen = getByTestId('ayna-mirror-screen');
        expect(aynaMirrorScreen).toBeTruthy();
      });

      // Simulate user signing out
      act(() => {
        authCallback('SIGNED_OUT', null);
      });

      // Re-render to reflect auth state change
      rerender(
        <TestWrapper>
          <AynaMirrorPage />
        </TestWrapper>
      );

      // Should now redirect to sign-in
      await waitFor(() => {
        const redirect = getByTestId('redirect');
        expect(redirect.props['data-href']).toBe('/auth/sign-in');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      // Mock authentication error
      mockAuth.getSession.mockRejectedValue(new Error('Auth error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { queryByTestId } = render(
        <TestWrapper>
          <AynaMirrorPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should handle error gracefully and not crash
        expect(queryByTestId('redirect')).toBeTruthy();
      });

      consoleSpy.mockRestore();
    });

    it('should handle session parsing errors', async () => {
      // Mock malformed session response
      mockAuth.getSession.mockResolvedValue({
        data: { session: 'invalid-session' as any },
        error: null,
      } as any);

      const { queryByTestId } = render(
        <TestWrapper>
          <AynaMirrorPage />
        </TestWrapper>
      );

      // Should handle gracefully
      await waitFor(() => {
        expect(queryByTestId('redirect')).toBeTruthy();
      });
    });
  });

  describe('Context Integration', () => {
    it('should properly integrate with AuthContext', async () => {
      // Create a test component that uses useAuth
      const TestComponent = () => {
        const { user, session, loading } = useAuth();
        
        return (
          <div data-testid="auth-state">
            <span data-testid="user-id">{user?.id || 'no-user'}</span>
            <span data-testid="session-status">{session ? 'has-session' : 'no-session'}</span>
            <span data-testid="loading-status">{loading ? 'loading' : 'loaded'}</span>
          </div>
        );
      };

      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'context-test-user' },
            access_token: 'token',
            refresh_token: 'refresh-token',
          },
        },
        error: null,
      } as any);

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('user-id').textContent).toBe('context-test-user');
        expect(getByTestId('session-status').textContent).toBe('has-session');
        expect(getByTestId('loading-status').textContent).toBe('loaded');
      });
    });
  });
});