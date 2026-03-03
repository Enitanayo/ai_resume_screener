import useCandidateStore from '../store/CandidateScore';

/**
 * Custom hook for candidates data
 */
export const useCandidates = () => {
    const {
        candidates,
        selectedCandidate,
        isLoading,
        error,
        fetchCandidates,
        fetchCandidateById,
        updateCandidateStatus,
        setSelectedCandidate,
        clearCandidates,
        clearError,
    } = useCandidateStore();

    return {
        candidates,
        selectedCandidate,
        isLoading,
        error,
        fetchCandidates,
        fetchCandidateById,
        updateCandidateStatus,
        setSelectedCandidate,
        clearCandidates,
        clearError,
        totalCandidates: candidates.length,
        averageScore:
            candidates.length > 0
                ? (
                    candidates.reduce((sum, c) => sum + (c.score_breakdown?.total_score || 0), 0) /
                    candidates.length
                ).toFixed(2)
                : 0,
    };
};

export default useCandidates;
