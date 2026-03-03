import { SCORE_THRESHOLDS } from './constants';

/**
 * Get initials from a name
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

/**
 * Get color class based on application status
 * @param {string} status
 * @returns {string}
 */
export const getStatusColor = (status) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        shortlisted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        hired: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[status] || colors.pending;
};

/**
 * Get color class based on score value
 * @param {number} score - Score between 0 and 1
 * @returns {{ color: string, bgColor: string, label: string }}
 */
export const getScoreColor = (score) => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) {
        return { color: 'text-green-600', bgColor: 'bg-green-500', ringColor: 'stroke-green-500', label: 'Excellent' };
    }
    if (score >= SCORE_THRESHOLDS.GOOD) {
        return { color: 'text-primary-600', bgColor: 'bg-primary-500', ringColor: 'stroke-primary-500', label: 'Good' };
    }
    if (score >= SCORE_THRESHOLDS.AVERAGE) {
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-500', ringColor: 'stroke-yellow-500', label: 'Average' };
    }
    return { color: 'text-red-600', bgColor: 'bg-red-500', ringColor: 'stroke-red-500', label: 'Poor' };
};

/**
 * Parse comma-separated requirements string into array
 * @param {string} requirements
 * @returns {string[]}
 */
export const parseRequirements = (requirements) => {
    if (!requirements) return [];
    return requirements.split(',').map((r) => r.trim()).filter(Boolean);
};

/**
 * Extract email from text
 * @param {string} text
 * @returns {string|null}
 */
export const extractEmail = (text) => {
    if (!text) return null;
    const match = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    return match ? match[0] : null;
};

/**
 * Debounce function
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};
