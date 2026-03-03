import { motion } from 'framer-motion';
import JobCard from './JobCard';
import Loading from '../common/Loading';

const JobList = ({ jobs, isLoading, isRecruiter = false, onDelete, emptyMessage = 'No jobs found' }) => {
    if (isLoading) {
        return <Loading text="Loading jobs..." />;
    }

    if (!jobs || jobs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, index) => (
                <motion.div
                    key={job.$id || job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <JobCard job={job} isRecruiter={isRecruiter} onDelete={onDelete} />
                </motion.div>
            ))}
        </div>
    );
};

export default JobList;
