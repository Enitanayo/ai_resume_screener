import { create } from 'zustand';
import { getAllJobs, getJobById, createJob as apiCreateJob, deleteJob as apiDeleteJob } from '../services/api';

const useJobStore = create((set, get) => ({
    jobs: [],
    selectedJob: null,
    isLoading: false,
    error: null,

    fetchJobs: async () => {
        set({ isLoading: true, error: null });
        try {
            const jobs = await getAllJobs();
            set({ jobs, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchJobById: async (jobId) => {
        set({ isLoading: true, error: null });
        try {
            const job = await getJobById(jobId);
            set({ selectedJob: job, isLoading: false });
            return job;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return null;
        }
    },

    createJob: async (jobData) => {
        set({ isLoading: true, error: null });
        try {
            const newJob = await apiCreateJob(jobData);
            set((state) => ({
                jobs: [newJob, ...state.jobs],
                isLoading: false,
            }));
            return { success: true, data: newJob };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    deleteJob: async (jobId) => {
        set({ isLoading: true, error: null });
        try {
            await apiDeleteJob(jobId);
            set((state) => ({
                jobs: state.jobs.filter((job) => job.id !== jobId),
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    setSelectedJob: (job) => set({ selectedJob: job }),
    clearError: () => set({ error: null }),
}));

export default useJobStore;
