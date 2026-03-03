/**
 * Auth Service — uses the FastAPI backend for authentication.
 * 
 * Auth flow:
 * 1. register() → POST /auth/register (creates recruiter user)
 * 2. login() → POST /auth/login (returns JWT access token)
 * 3. getCurrentUser() → GET /auth/me (gets user profile with JWT)
 * 4. logout() → clears local JWT (no server-side session)
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const authService = {
    /**
     * Register a new user via backend API
     * @param {string} email 
     * @param {string} password 
     * @param {string} firstName 
     * @param {string} lastName 
     * @returns {Promise} Created user object
     */
    register: async (email, password, firstName, lastName) => {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
            first_name: firstName,
            last_name: lastName,
            email,
            password,
        });
        return response.data;
    },

    /**
     * Login via backend API (returns JWT access token)
     * The backend uses OAuth2PasswordRequestForm, so we must send
     * form-urlencoded data with 'username' and 'password' fields.
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise} { access_token, token_type }
     */
    login: async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);    // OAuth2 uses 'username' field
        formData.append('password', password);

        const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data; // { access_token, token_type }
    },

    /**
     * Get the current logged-in user's profile via backend API.
     * Requires valid JWT in Authorization header.
     * @param {string} token - JWT access token
     * @returns {Promise} User object { id, first_name, last_name, email }
     */
    getCurrentUser: async (token) => {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    /**
     * Logout — no server-side session to destroy, just clear local state.
     * This is a no-op on the network side.
     */
    logout: async () => {
        // Backend uses stateless JWT — nothing to call server-side
    },

    /**
     * Determine role from user data.
     * Since the backend currently only supports recruiter registration,
     * all authenticated users are recruiters. This can be extended later.
     * @param {Object} user - Backend user object
     * @returns {string} Role string
     */
    getUserRole: (user) => {
        // Backend only has recruiters for now, but we check for a role field
        // that may be added later
        if (!user) return 'candidate'; // default
        if (user.role) return user.role;
        // If the user came from /auth/me (recruiter endpoint), they're a recruiter
        return 'recruiter';
    },

    /**
     * Check if a JWT is still valid (basic expiry check)
     * @param {string} jwt 
     * @returns {boolean}
     */
    isJWTValid: (jwt) => {
        if (!jwt) return false;
        try {
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    },
};

export default authService;
