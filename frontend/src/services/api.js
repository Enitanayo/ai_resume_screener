import axios from 'axios';
import useAuthStore from '../store/authStore';
import authService from './authService';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes default
});

/**
 * Request interceptor — attaches JWT as Authorization: Bearer header.
 * If JWT is expired, logs out (backend uses stateless JWT, no refresh).
 */
apiClient.interceptors.request.use(
  async (config) => {
    let jwt = useAuthStore.getState().jwt;

    // If JWT exists but is expired, force logout
    if (jwt && !authService.isJWTValid(jwt)) {
      useAuthStore.getState().logout();
      jwt = null;
    }

    if (jwt) {
      config.headers['Authorization'] = `Bearer ${jwt}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired — clear auth state and redirect
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// JOB ENDPOINTS (backend prefix: /api/jobs)
// ============================================

/**
 * Create a new job posting (Recruiter only)
 * Backend expects: { job_title, job_description, required_skills }
 * @param {Object} jobData - { job_title, job_description, required_skills }
 * @returns {Promise} Created job object
 */
export const createJob = async (jobData) => {
  try {
    const response = await apiClient.post('/api/jobs', jobData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get all jobs for the authenticated recruiter
 * @returns {Promise} Array of job objects
 */
export const getAllJobs = async () => {
  try {
    const response = await apiClient.get('/api/jobs');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get a specific job by ID
 * @param {number} jobId - Job ID (integer)
 * @returns {Promise} Job object
 */
export const getJobById = async (jobId) => {
  try {
    const response = await apiClient.get(`/api/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete a job posting (Recruiter only)
 * @param {number} jobId - Job ID
 * @returns {Promise} No content (204)
 */
export const deleteJob = async (jobId) => {
  try {
    const response = await apiClient.delete(`/api/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update a job posting (Recruiter only)
 * @param {number} jobId - Job ID
 * @param {Object} jobData - Fields to update
 * @returns {Promise} Updated job object
 */
export const updateJob = async (jobId, jobData) => {
  try {
    const response = await apiClient.patch(`/api/jobs/${jobId}`, jobData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ============================================
// APPLICATION / CANDIDATE ENDPOINTS
// ============================================

/**
 * Apply to a specific job with a resume file.
 * Backend expects form fields: first_name, last_name, email, resume (file)
 * @param {number} jobId - Job ID
 * @param {FormData} formData - Must contain 'resume', 'first_name', 'last_name', 'email'
 * @returns {Promise} Candidate application object
 */
export const applyToJob = async (jobId, formData) => {
  try {
    const response = await apiClient.post(`/application/apply/${jobId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get all candidates for a specific job (Recruiter only)
 * @param {number} jobId - Job ID
 * @returns {Promise} Array of candidate objects
 */
export const getCandidatesByJob = async (jobId) => {
  try {
    const response = await apiClient.get(`/api/jobs/${jobId}/candidates`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get a specific candidate's details (Recruiter only)
 * @param {number} jobId - Job ID
 * @param {number} candidateId - Candidate ID
 * @returns {Promise} Candidate application object
 */
export const getCandidateById = async (jobId, candidateId) => {
  try {
    const response = await apiClient.get(`/api/jobs/${jobId}/candidate/${candidateId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get analytics for a specific job (Recruiter only)
 * @param {number} jobId - Job ID
 * @returns {Promise} { total_applicants, average_score, top_skills }
 */
export const getJobAnalytics = async (jobId) => {
  try {
    const response = await apiClient.get(`/api/jobs/${jobId}/analytics`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ============================================
// BATCH UPLOAD & RANKING ENDPOINTS
// Uses existing backend routes to implement batch functionality
// ============================================

/**
 * Match/rank candidates for a job using existing candidates endpoint.
 * Fetches all processed candidates sorted by score and transforms
 * into the format expected by BatchUpload.jsx.
 * @param {number} jobId - Job ID
 * @returns {Promise} Array of ranked candidate objects
 */
export const matchCandidates = async (jobId, candidateIds = null) => {
  try {
    const candidates = await getCandidatesByJob(jobId);
    let filtered = candidates || [];

    // If a specific list of IDs was provided (current batch), filter for them
    if (candidateIds && Array.isArray(candidateIds)) {
      const idSet = new Set(candidateIds.map(String));
      filtered = filtered.filter(c => idSet.has(String(c.id)));
    }

    // Transform into the ranked format expected by BatchUpload.jsx
    return filtered
      .filter(c => c.processing_status === 'ready' && c.total_weighted_score != null)
      .sort((a, b) => (b.total_weighted_score || 0) - (a.total_weighted_score || 0))
      .map(c => ({
        candidate_id: String(c.id),
        candidate_name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
        match_percentage: (c.total_weighted_score || 0) * 100,
        score_breakdown: {
          semantic_similarity: c.semantic_score,
          keyword_match: c.keyword_score,
          context_score: c.context_score,
        },
        raw_text: c.raw_text,
        matched_skills: c.matched_skills,
        parsed_skills: c.parsed_skills,
      }));
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Download the original resume file for a candidate
 * @param {number} jobId - Job ID
 * @param {number} candidateId - Candidate ID
 */
export const downloadResume = async (jobId, candidateId) => {
  try {
    const response = await apiClient.get(
      `/api/jobs/${jobId}/candidate/${candidateId}/resume`,
      { responseType: 'blob' }
    );

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'resume';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (match) filename = match[1];
    }

    // Trigger browser download
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * STUB: Get applications for the current candidate
 * Not yet implemented in backend.
 */
export const getMyApplications = async () => {
  console.warn('getMyApplications: endpoint not available in backend');
  return [];
};

/**
 * Batch upload resumes for a job.
 * Calls the existing /application/apply/{jobId} endpoint once per file.
 * @param {number} jobId - Job ID
 * @param {File[]} files - Array of resume files
 * @returns {Promise} { batch_id, count, candidate_ids }
 */
export const batchUpload = async (jobId, files) => {
  try {
    let successCount = 0;
    const candidate_ids = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const fd = new FormData();
        // Generate candidate info from file name or index
        const baseName = files[i].name.replace(/\.(pdf|docx|doc)$/i, '').replace(/[_-]/g, ' ');
        const nameParts = baseName.trim().split(/\s+/);
        const firstName = nameParts[0] || `Candidate`;
        const lastName = nameParts.slice(1).join(' ') || `${i + 1}`;

        fd.append('first_name', firstName);
        fd.append('last_name', lastName);
        fd.append('email', `candidate_${Date.now()}_${i}@batch.upload`);
        fd.append('resume', files[i]);

        const response = await apiClient.post(`/application/apply/${jobId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data && response.data.id) {
          candidate_ids.push(String(response.data.id));
        }

        successCount++;
      } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'Upload failed';
        errors.push(`${files[i].name}: ${msg}`);
      }
    }

    if (errors.length > 0 && successCount === 0) {
      throw new Error(`All uploads failed: ${errors.join('; ')}`);
    }

    return {
      batch_id: String(jobId),
      count: successCount,
      candidate_ids: candidate_ids
    };
  } catch (error) {
    if (error.message?.startsWith('All uploads failed')) throw error;
    throw handleApiError(error);
  }
};

/**
 * Get batch processing status by checking candidate processing states.
 * Uses existing /api/jobs/{jobId}/candidates endpoint.
 * @param {string} batchId - Batch ID (same as job ID)
 * @returns {Promise} { batch_id, total, processed, pending, failed }
 */
export const getBatchStatus = async (batchId) => {
  try {
    const candidates = await getCandidatesByJob(batchId);
    const all = candidates || [];
    const processed = all.filter(c => c.processing_status === 'ready').length;
    const failed = all.filter(c => c.processing_status === 'failed').length;
    const pending = all.filter(c =>
      c.processing_status === 'pending' || c.processing_status === 'processing'
    ).length;

    return {
      batch_id: batchId,
      total: all.length,
      processed,
      pending,
      failed,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Trigger resume analysis for a job.
 * Not needed — the backend auto-queues processing when applications are created.
 * This just checks how many pending applications exist.
 * @param {number} jobId - Job ID
 * @returns {Promise} { queued, batch_id }
 */
export const analyseResumes = async (jobId, applicationIds = []) => {
  try {
    const candidates = await getCandidatesByJob(jobId);
    const all = candidates || [];
    const pending = all.filter(c =>
      c.processing_status === 'pending' || c.processing_status === 'processing'
    ).length;

    return { queued: pending, batch_id: String(jobId) };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * STUB: Get aggregated dashboard analytics
 * Not yet implemented in backend as a single endpoint.
 */
export const getDashboardAnalytics = async () => {
  console.warn('getDashboardAnalytics: endpoint not available in backend');
  return null;
};

/**
 * STUB: Get analytics for the current candidate
 * Not yet implemented in backend.
 */
export const getCandidateAnalytics = async () => {
  console.warn('getCandidateAnalytics: endpoint not available in backend');
  return null;
};

/**
 * STUB: Set the user's role after registration
 * Not implemented — backend determines role from the registration endpoint.
 */
export const setUserRole = async (role) => {
  console.warn('setUserRole: not needed with backend JWT auth');
  return { message: 'Role set locally', role };
};

/**
 * STUB: Check if API is reachable
 */
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Handle API errors and format them consistently
 */
const handleApiError = (error) => {
  if (error.response) {
    return {
      message: error.response.data.message || error.response.data.detail || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    return {
      message: 'No response from server. Please check your internet connection.',
      status: 0,
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
    };
  }
};

/**
 * Create FormData with a file for resume uploads.
 * Backend expects the field name 'resume' (not 'file').
 */
export const createFormDataWithFile = (file, additionalData = {}) => {
  const formData = new FormData();
  formData.append('resume', file);

  Object.keys(additionalData).forEach((key) => {
    formData.append(key, additionalData[key]);
  });

  return formData;
};

// Export the configured axios instance for custom requests
export default apiClient;