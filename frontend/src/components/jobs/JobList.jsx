import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import JobCard from './JobCard';
import { CardSkeleton } from '../common/Loading';

const JobList = ({
    jobs = [],
    isLoading = false,
    isRecruiter = false,
    onDelete,
    emptyMessage = 'No jobs found',
}) => {
    if (isLoading) {
        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="text-center py-12 px-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-dark-600" />
                </div>
                <p className="text-dark-400 font-medium">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
                <JobCard
                    key={job.$id || job.id}
                    job={job}
                    isRecruiter={isRecruiter}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default JobList;
