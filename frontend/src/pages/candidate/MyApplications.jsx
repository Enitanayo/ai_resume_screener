import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Clock, FileText, ExternalLink } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import { useNavigate } from 'react-router-dom';
import { getMyApplications } from '../../services/api';
import { formatDate } from '../../utils/formatters';

const statusConfig = {
    pending: { variant: 'warning', label: 'Pending' },
    processing: { variant: 'info', label: 'Processing' },
    ready: { variant: 'success', label: 'Reviewed' },
    rejected: { variant: 'danger', label: 'Rejected' },
};

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const data = await getMyApplications();
                setApplications(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if (isLoading) return <Loading text="Loading applications..." />;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
            <div className="mb-8">
                <h1 className="text-2xl font-heading font-bold text-dark-50">My Applications</h1>
                <p className="text-dark-400 text-sm mt-1">Track the status of your job applications</p>
            </div>

            {applications.length > 0 ? (
                <div className="space-y-3">
                    {applications.map((app, index) => {
                        const status = statusConfig[app.processing_status] || statusConfig.pending;
                        const score = app.total_weighted_score;

                        return (
                            <motion.div
                                key={app.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                            >
                                <Card hover className="p-5 cursor-pointer" onClick={() => navigate(`/candidate/jobs/${app.job_id}`)}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="p-2.5 rounded-xl bg-primary-500/10 flex-shrink-0">
                                                <Briefcase className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-base font-semibold text-dark-50 truncate">
                                                    {app.job_title || 'Job Application'}
                                                </h3>
                                                <div className="flex items-center gap-3 text-xs text-dark-400 mt-0.5">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(app.applied_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {score != null && (
                                                <span className="text-lg font-bold font-mono text-emerald-400">
                                                    {(score * 100).toFixed(0)}%
                                                </span>
                                            )}
                                            <Badge variant={status.variant} dot size="sm">
                                                {status.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <FileText className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-dark-50 mb-2">No applications yet</h3>
                    <p className="text-dark-400 mb-4">
                        Browse available jobs and start applying!
                    </p>
                    <button
                        onClick={() => navigate('/candidate/browse')}
                        className="text-primary-400 hover:text-primary-300 font-semibold text-sm transition-colors"
                    >
                        Browse Jobs →
                    </button>
                </Card>
            )}
        </motion.div>
    );
};

export default MyApplications;
