import { motion } from 'framer-motion';
import CandidatesCard from './CandidatesCard';
import Loading from '../common/Loading';

const CandidateList = ({ candidates, isLoading, onCandidateClick, emptyMessage = 'No candidates found' }) => {
    if (isLoading) {
        return <Loading text="Loading candidates..." />;
    }

    if (!candidates || candidates.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {candidates.map((candidate, index) => (
                <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <CandidatesCard
                        candidate={candidate}
                        onClick={onCandidateClick}
                        rank={index + 1}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default CandidateList;
