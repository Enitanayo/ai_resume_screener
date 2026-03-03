import { useEffect } from 'react';
import useJobStore from '../store/jobStore';

/**
 * Custom hook for jobs data
 * @param {boolean} autoFetch - Whether to fetch jobs on mount
 */
export const useJobs = (autoFetch = true) => {
    const {
        jobs,
        selectedJob,
        isLoading,
        error,
        fetchJobs,
        fetchJobById,
        createJob,
        deleteJob,
        setSelectedJob,
        clearError,
    } = useJobStore();

    useEffect(() => {
        if (autoFetch && jobs.length === 0) {
            fetchJobs();
        }
    }, [autoFetch, fetchJobs, jobs.length]);

    return {
        jobs,
        selectedJob,
        isLoading,
        error,
        fetchJobs,
        fetchJobById,
        createJob,
        deleteJob,
        setSelectedJob,
        clearError,
        activeJobs: jobs.filter((job) => job.is_active),
        totalJobs: jobs.length,
    };
};

export default useJobs;
