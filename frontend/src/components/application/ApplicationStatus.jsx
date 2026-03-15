import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { STATUS_LABELS } from '../../utils/constants';

const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'warning' },
    under_review: { icon: Loader2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'info' },
    shortlisted: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'success' },
    rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'danger' },
    hired: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'primary' },
};

const ApplicationStatus = ({ status = 'pending', score, candidateId }) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="p-8 text-center relative overflow-hidden group">
                {/* Background glow effect */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[60px] opacity-20 transition-all duration-700 ${config.bg.replace('10', '40')}`} />

                <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                        <div className={`p-5 rounded-2xl ${config.bg} ${config.color} border border-white/[0.05] shadow-xl`}>
                            <Icon className={`w-10 h-10 ${status === 'under_review' ? 'animate-spin' : ''}`} />
                        </div>
                    </div>

                    <h3 className="text-xl font-heading font-bold text-dark-50 mb-3">
                        Application Status
                    </h3>

                    <Badge variant={config.label} size="lg" dot className="px-4 py-1.5 text-sm uppercase tracking-widest font-bold">
                        {STATUS_LABELS[status] || status}
                    </Badge>

                    {score !== undefined && (
                        <div className="mt-8 pt-8 border-t border-white/[0.06]">
                            <p className="text-sm font-bold text-dark-500 uppercase tracking-widest mb-2">Match Score</p>
                            <p className="text-4xl font-bold font-mono text-gradient">
                                {Math.round(score * 100)}%
                            </p>
                            <div className="mt-4 w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score * 100}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                                />
                            </div>
                        </div>
                    )}

                    {candidateId && (
                        <p className="mt-6 text-[10px] font-mono font-bold text-dark-600 uppercase tracking-widest">
                            ID: {candidateId}
                        </p>
                    )}
                </div>
            </Card>
        </motion.div>
    );
};

export default ApplicationStatus;
