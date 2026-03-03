import { create } from 'zustand';
import { getCandidatesByJob, getCandidateById } from '../services/api';

const useCandidateStore = create((set, get) => ({
    candidates: [],
    selectedCandidate: null,
    isLoading: false,
    error: null,

    /**
     * Fetch all candidates for a specific job
     * Backend returns candidates with: id, first_name, last_name, email,
     * total_weighted_score, semantic_score, keyword_score, context_score,
     * parsed_skills, matched_skills, processing_status, applied_at
     */
    fetchCandidates: async (jobId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await getCandidatesByJob(jobId);
            set({ candidates: data || [], isLoading: false });
        } catch (err) {
            set({
                error: err.message || 'Failed to load candidates',
                isLoading: false,
            });
        }
    },

    /**
     * Fetch a specific candidate's details by job and candidate ID
     */
    fetchCandidate: async (jobId, candidateId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await getCandidateById(jobId, candidateId);
            set({ selectedCandidate: data, isLoading: false });
        } catch (err) {
            set({
                error: err.message || 'Failed to load candidate',
                isLoading: false,
            });
        }
    },

    /**
     * Select a candidate from the current list
     */
    selectCandidate: (candidate) => {
        set({ selectedCandidate: candidate });
    },

    /**
     * Clear the selected candidate
     */
    clearSelection: () => {
        set({ selectedCandidate: null });
    },

    /**
     * Clear all state
     */
    reset: () => {
        set({ candidates: [], selectedCandidate: null, isLoading: false, error: null });
    },
}));

export default useCandidateStore;
