// Routes configuration - exported as array for potential dynamic routing
import { ROUTES } from '../utils/constants';

export const publicRoutes = [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.ABOUT, label: 'About' },
    { path: ROUTES.HOW_IT_WORKS, label: 'How It Works' },
    { path: ROUTES.CONTACT, label: 'Contact' },
];

export const recruiterRoutes = [
    { path: ROUTES.RECRUITER_DASHBOARD, label: 'Dashboard' },
    { path: ROUTES.RECRUITER_JOBS, label: 'Jobs' },
    { path: ROUTES.RECRUITER_ANALYTICS, label: 'Analytics' },
];

export const candidateRoutes = [
    { path: ROUTES.CANDIDATE_BROWSE, label: 'Browse Jobs' },
    { path: ROUTES.CANDIDATE_APPLICATIONS, label: 'My Applications' },
    { path: ROUTES.CANDIDATE_PROFILE, label: 'Profile' },
];

export default { publicRoutes, recruiterRoutes, candidateRoutes };
