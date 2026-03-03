// File service - helpers for file uploads and validation

const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const fileService = {
    /**
     * Validate a resume file
     * @param {File} file - File to validate
     * @returns {{ valid: boolean, error?: string }}
     */
    validateResumeFile: (file) => {
        if (!file) {
            return { valid: false, error: 'No file selected' };
        }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return { valid: false, error: 'Only PDF and DOCX files are allowed' };
        }
        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'File size must be less than 10MB' };
        }
        return { valid: true };
    },

    /**
     * Create FormData for resume upload
     * @param {File} file - Resume file
     * @param {Object} additionalData - Additional form fields
     * @returns {FormData}
     */
    createResumeFormData: (file, additionalData = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });
        return formData;
    },

    /**
     * Get file extension from filename
     * @param {string} fileName
     * @returns {string}
     */
    getFileExtension: (fileName) => {
        return fileName.split('.').pop().toLowerCase();
    },

    /**
     * Format file size for display
     * @param {number} bytes
     * @returns {string}
     */
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE,
};

export default fileService;
