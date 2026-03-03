import { motion } from 'framer-motion';
import { Clock, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

const JobCard = ({ job, isRecruiter = false, onDelete }) => {
    const navigate = useNavigate();

    // Backend returns required_skills as a list
    const skills = job.required_skills || [];

    const jobId = job.$id || job.id;

    const handleClick = () => {
        if (isRecruiter) {
            navigate(`/recruiter/jobs/${jobId}/candidates`);
        } else {
            navigate(`/candidate/jobs/${jobId}`);
        }
    };

    // Backend uses processing_status instead of is_active
    const isReady = job.processing_status === 'ready';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Card hover className="p-6 h-full flex flex-col" onClick={handleClick}>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {job.job_title || job.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(job.created_at)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={isReady ? 'success' : 'warning'} dot>
                            {isReady ? 'Ready' : job.processing_status || 'Processing'}
                        </Badge>
                    </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-2">
                    {job.job_description || job.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {skills.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="primary" size="sm">
                            {skill}
                        </Badge>
                    ))}
                    {skills.length > 5 && (
                        <Badge variant="neutral" size="sm">
                            +{skills.length - 5} more
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-700">
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={ChevronRight}
                        iconPosition="right"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                    >
                        {isRecruiter ? 'View Candidates' : 'View Details'}
                    </Button>
                    {isRecruiter && onDelete && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(jobId);
                            }}
                            className="relative z-10 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete job"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </Card>
        </motion.div>
    );
};

export default JobCard;
