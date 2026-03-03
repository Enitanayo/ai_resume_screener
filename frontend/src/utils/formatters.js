/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format date with time
 * @param {string} dateString
 * @returns {string}
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string} dateString
 * @returns {string}
 */
export const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
};

/**
 * Format a decimal score to a percentage string
 * @param {number} score - Score between 0 and 1
 * @returns {string} Percentage string (e.g., "75%")
 */
export const formatScore = (score) => {
    if (score === null || score === undefined) return 'N/A';
    return `${Math.round(score * 100)}%`;
};

/**
 * Format a decimal score to a numeric percentage
 * @param {number} score - Score between 0 and 1
 * @returns {number} Percentage number
 */
export const scoreToPercent = (score) => {
    if (score === null || score === undefined) return 0;
    return Math.round(score * 100);
};

/**
 * Truncate text to a specified length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format experience years
 * @param {number} years
 * @returns {string}
 */
export const formatExperience = (years) => {
    if (years === null || years === undefined) return 'N/A';
    if (years < 1) return 'Less than 1 year';
    if (years === 1) return '1 year';
    return `${years} years`;
};
