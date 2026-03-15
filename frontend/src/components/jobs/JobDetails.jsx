import { motion } from 'framer-motion';
import { Calendar, Tag } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

const JobDetails = ({ job, onApply, onEdit, onDelete, isRecruiter = false }) => {
    if (!job) return null;

    // Backend returns required_skills as a list
    const skills = job.required_skills || [];
    const isReady = job.processing_status === 'ready';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-50 mb-2 font-heading">
                            {job.job_title || job.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-dark-400 flex-wrap">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Posted on {formatDate(job.created_at)}
                            </span>
                            <Badge variant={isReady ? 'success' : 'warning'} dot>
                                {isReady ? 'Ready' : job.processing_status || 'Processing'}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isRecruiter ? (
                            <>
                                {onEdit && (
                                    <Button variant="outline" size="sm" onClick={onEdit}>
                                        Edit
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button variant="danger" size="sm" onClick={onDelete}>
                                        Delete
                                    </Button>
                                )}
                            </>
                        ) : (
                            isReady && onApply && (
                                <Button variant="primary" onClick={onApply}>
                                    Apply Now
                                </Button>
                            )
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-dark-50 mb-3">
                        Description
                    </h2>
                    <p className="text-dark-300 leading-relaxed whitespace-pre-line">
                        {job.job_description || job.description}
                    </p>
                </div>

                {/* Required Skills */}
                {skills.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-dark-50 mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Required Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                                        bg-primary-500/10 text-primary-400 border border-primary-500/20"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        </motion.div>
    );
};

export default JobDetails;
