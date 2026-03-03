import useAuthStore from '../store/authStore';

/**
 * Custom hook for authentication.
 * Provides convenient access to auth state and actions.
 * 
 * Role checks use Appwrite labels:
 * - 'recruiter' label → isRecruiter = true
 * - 'admin' label → isRecruiter = true, isCandidate = false
 * - No label or 'candidate' label → isCandidate = true
 */
export const useAuth = () => {
    const {
        user,
        jwt,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        fetchUser,
        initAuth,
        refreshJWT,
        clearError,
        isRecruiter,
        isCandidate,
    } = useAuthStore();

    return {
        user,
        jwt,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        fetchUser,
        initAuth,
        refreshJWT,
        clearError,
        isRecruiter: isRecruiter(),
        isCandidate: isCandidate(),
        userRole: user?.role || 'candidate',
    };
};

export default useAuth;
