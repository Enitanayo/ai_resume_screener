import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      jwt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Register a new user via backend API.
       * After registration, automatically logs them in.
       */
      register: async (email, password, name, role = 'recruiter') => {
        set({ isLoading: true, error: null });
        try {
          // Split name into first_name and last_name
          const nameParts = (name || '').trim().split(/\s+/);
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Completely Frontend Role Logic:
          // Save the role to local storage BEFORE calling login so getUserRole will see it
          authService.setFrontendRole(email, role);

          await authService.register(email, password, firstName, lastName);

          // Auto-login after registration
          const result = await get().login(email, password);

          return { ...result, role };
        } catch (error) {
          const message = error.response?.data?.detail || error.message || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      /**
       * Login via backend API.
       * Gets JWT token → fetches user profile.
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Get JWT token from backend
          const tokenData = await authService.login(email, password);
          const jwt = tokenData.access_token;

          // 2. Get user profile using the JWT
          const user = await authService.getCurrentUser(jwt);
          const role = authService.getUserRole(user);

          set({
            user: { ...user, name: `${user.first_name} ${user.last_name}`.trim(), role },
            jwt,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true, role };
        } catch (error) {
          const message = error.response?.data?.detail || error.message || 'Login failed';
          set({
            error: message,
            isLoading: false,
          });
          return { success: false, error: message };
        }
      },

      /**
       * Logout — clears local JWT and state.
       */
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Explicitly clear persisted auth state from localStorage
          localStorage.removeItem('auth-storage');
          set({
            user: null,
            jwt: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      /**
       * Initialize auth — checks if saved JWT is still valid on app startup.
       * Called once in App.jsx useEffect.
       */
      initAuth: async () => {
        set({ isLoading: true });
        try {
          const jwt = get().jwt;

          // Check if JWT exists and is still valid
          if (!jwt || !authService.isJWTValid(jwt)) {
            set({
              user: null,
              jwt: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          // Verify the JWT is still accepted by the backend
          const user = await authService.getCurrentUser(jwt);
          const role = authService.getUserRole(user);

          set({
            user: { ...user, name: `${user.first_name} ${user.last_name}`.trim(), role },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // JWT invalid or expired
          set({
            user: null,
            jwt: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      /**
       * Refresh JWT — not supported with backend's stateless JWT.
       * If the JWT has expired, the user must login again.
       */
      refreshJWT: async () => {
        const jwt = get().jwt;
        if (jwt && authService.isJWTValid(jwt)) {
          return jwt;
        }
        // JWT expired — force logout
        await get().logout();
        return null;
      },

      /**
       * Fetch current user profile from backend.
       */
      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const jwt = get().jwt;
          if (!jwt) throw new Error('No JWT');

          const user = await authService.getCurrentUser(jwt);
          const role = authService.getUserRole(user);
          set({
            user: { ...user, name: `${user.first_name} ${user.last_name}`.trim(), role },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message,
          });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Role checks
      isRecruiter: () => {
        const user = get().user;
        return user?.role === 'recruiter' || user?.role === 'admin';
      },

      isCandidate: () => {
        const user = get().user;
        return user?.role === 'candidate' || !user?.role;
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        jwt: state.jwt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;