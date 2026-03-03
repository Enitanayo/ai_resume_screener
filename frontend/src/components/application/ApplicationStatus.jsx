import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { STATUS_LABELS } from '../../utils/constants';

const statusIcons = {
    pending: Clock,
    under_review: Loader2,
    shortlisted: CheckCircle,
    rejected: XCircle,
    hired: CheckCircle,
};

const statusVariants = {
    pending: 'warning',
    under_review: 'info',
    shortlisted: 'success',
    rejected: 'danger',
    hired: 'primary',
};

const ApplicationStatus = ({ status = 'pending', score, candidateId }) => {
    const Icon = statusIcons[status] || Clock;
    const variant = statusVariants[status] || 'neutral';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <Card className="p-6 text-center">
                <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full bg-${variant === 'success' ? 'green' : variant === 'danger' ? 'red' : variant === 'warning' ? 'yellow' : 'blue'}-100
            dark:bg-${variant === 'success' ? 'green' : variant === 'danger' ? 'red' : variant === 'warning' ? 'yellow' : 'blue'}-900/20`}>
                        <Icon className="w-8 h-8 text-primary-500" />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Application Status
                </h3>

                <Badge variant={variant} size="lg" dot>
                    {STATUS_LABELS[status] || status}
                </Badge>

                {score !== undefined && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Match Score</p>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {Math.round(score * 100)}%
                        </p>
                    </div>
                )}

                {candidateId && (
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        Candidate ID: {candidateId}
                    </p>
                )}
            </Card>
        </motion.div>
    );
};

export default ApplicationStatus;
