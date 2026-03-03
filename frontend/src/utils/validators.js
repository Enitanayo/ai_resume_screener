/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validatePassword = (password) => {
    const errors = [];
    if (!password || password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
    return { valid: errors.length === 0, errors };
};

/**
 * Validate required field
 * @param {string} value
 * @param {string} fieldName
 * @returns {string|null} Error message or null
 */
export const validateRequired = (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} is required`;
    }
    return null;
};

/**
 * Validate job form data
 * @param {Object} data
 * @returns {{ valid: boolean, errors: Object }}
 */
export const validateJobForm = (data) => {
    const errors = {};
    if (!data.job_title?.trim()) errors.job_title = 'Job title is required';
    if (!data.job_description?.trim()) errors.job_description = 'Description is required';
    if (!data.required_skills || data.required_skills.length === 0) errors.required_skills = 'At least one skill is required';
    return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate login form data
 * @param {Object} data
 * @returns {{ valid: boolean, errors: Object }}
 */
export const validateLoginForm = (data) => {
    const errors = {};
    if (!data.email?.trim()) errors.email = 'Email is required';
    else if (!isValidEmail(data.email)) errors.email = 'Invalid email format';
    if (!data.password?.trim()) errors.password = 'Password is required';
    return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate registration form data
 * @param {Object} data
 * @returns {{ valid: boolean, errors: Object }}
 */
export const validateRegisterForm = (data) => {
    const errors = {};
    if (!data.name?.trim()) errors.name = 'Name is required';
    if (!data.email?.trim()) errors.email = 'Email is required';
    else if (!isValidEmail(data.email)) errors.email = 'Invalid email format';
    const passwordResult = validatePassword(data.password);
    if (!passwordResult.valid) errors.password = passwordResult.errors[0];
    if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return { valid: Object.keys(errors).length === 0, errors };
};
