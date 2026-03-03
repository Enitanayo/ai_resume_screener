import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock } from 'lucide-react';
import { getMyApplications } from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import { STATUS_LABELS } from '../../utils/constants';
import { formatDate, formatScore } from '../../utils/formatters';
import { getStatusColor, getScoreColor } from '../../utils/helpers';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getMyApplications();
                setApplications(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    if (isLoading) return <Loading text="Loading applications..." />;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Applications</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Track the status of your job applications</p>

                {applications.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No applications yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">Start applying to jobs to see your applications here.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app, index) => {
                            const score = app.score_breakdown?.total_score;
                            const { color } = score !== undefined ? getScoreColor(score) : { color: '' };
                            return (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card hover className="p-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {app.job_title || `Job #${app.job_id}`}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                    <Clock className="w-3.5 h-3.5" /> Applied {formatDate(app.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {score !== undefined && (
                                                    <span className={`text-lg font-bold ${color}`}>
                                                        {formatScore(score)}
                                                    </span>
                                                )}
                                                <Badge variant={app.status === 'shortlisted' ? 'success' : app.status === 'rejected' ? 'danger' : 'info'} dot>
                                                    {STATUS_LABELS[app.status] || app.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default MyApplications;
