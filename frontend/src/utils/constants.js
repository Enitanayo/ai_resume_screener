// Application constants

export const USER_ROLES = {
    RECRUITER: 'recruiter',
    CANDIDATE: 'candidate',
    ADMIN: 'admin',
};

export const APPLICATION_STATUS = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    SHORTLISTED: 'shortlisted',
    REJECTED: 'rejected',
    HIRED: 'hired',
};

export const STATUS_LABELS = {
    pending: 'Pending',
    under_review: 'Under Review',
    shortlisted: 'Shortlisted',
    rejected: 'Rejected',
    hired: 'Hired',
};

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    ABOUT: '/about',
    CONTACT: '/contact',
    HOW_IT_WORKS: '/how-it-works',
    // Recruiter
    RECRUITER_DASHBOARD: '/recruiter/dashboard',
    RECRUITER_JOBS: '/recruiter/jobs',
    RECRUITER_CREATE_JOB: '/recruiter/jobs/create',
    RECRUITER_EDIT_JOB: (id) => `/recruiter/jobs/${id}/edit`,
    RECRUITER_CANDIDATES: (id) => `/recruiter/jobs/${id}/candidates`,
    RECRUITER_ANALYTICS: '/recruiter/analytics',
    // Candidate
    CANDIDATE_BROWSE: '/candidate/browse',
    CANDIDATE_APPLY: (id) => `/candidate/apply/${id}`,
    CANDIDATE_APPLICATIONS: '/candidate/applications',
    CANDIDATE_PROFILE: '/candidate/profile',
};

export const SCORE_THRESHOLDS = {
    EXCELLENT: 0.8,
    GOOD: 0.6,
    AVERAGE: 0.4,
    POOR: 0,
};

export const FILE_CONFIG = {
    ALLOWED_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_EXTENSIONS: ['.pdf', '.docx'],
};
