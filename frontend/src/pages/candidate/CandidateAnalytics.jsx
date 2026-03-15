import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle, Clock, XCircle, FileText, Calendar } from 'lucide-react';
import { getCandidateAnalytics } from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatters';

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => {
    const colorMap = {
        primary: 'from-primary-500 to-primary-600 shadow-primary-500/20',
        green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
        amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
        red: 'from-red-500 to-red-600 shadow-red-500/20',
        blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
        >
            <Card className="p-5 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-tr ${colorMap[color] || colorMap.primary} shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-dark-400 font-medium">{label}</p>
                        <p className="text-2xl font-bold text-dark-50 mt-0.5 font-mono">{value}</p>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

// CSS-only Pie Chart component
const PieChart = ({ data }) => {
    const total = Object.values(data).reduce((sum, v) => sum + v, 0);
    if (total === 0) return null;

    const colors = {
        pending: '#f59e0b',
        processed: '#10b981',
        shortlisted: '#3b82f6',
        rejected: '#ef4444',
        failed: '#ef4444',
        error: '#dc2626',
    };

    let cumulativePercent = 0;
    const segments = Object.entries(data).map(([status, count]) => {
        const percent = (count / total) * 100;
        const segment = {
            status,
            count,
            percent,
            startPercent: cumulativePercent,
            color: colors[status] || '#6b7280',
        };
        cumulativePercent += percent;
        return segment;
    });

    const gradientParts = segments.map(
        (s) => `${s.color} ${s.startPercent}% ${s.startPercent + s.percent}%`
    );
    const gradient = `conic-gradient(${gradientParts.join(', ')})`;

    return (
        <div className="flex items-center gap-6">
            <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                className="w-32 h-32 rounded-full flex-shrink-0 shadow-lg"
                style={{ background: gradient }}
            />
            <div className="space-y-2">
                {segments.map((s) => (
                    <div key={s.status} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-sm text-dark-400 capitalize">{s.status}</span>
                        <span className="text-sm font-bold text-dark-50 font-mono">{s.count}</span>
                        <span className="text-xs text-dark-500 font-mono">({s.percent.toFixed(0)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// CSS-only Bar Chart component
const BarChart = ({ data }) => {
    if (!data.length) return null;
    const maxCount = Math.max(...data.map((d) => d.count), 1);

    return (
        <div className="flex items-end gap-2 h-44">
            {data.map((item, index) => {
                const heightPercent = (item.count / maxCount) * 100;
                return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
                            className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg relative group cursor-pointer"
                            style={{ minHeight: heightPercent > 0 ? '8px' : '0px' }}
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/[0.06]">
                                {item.count} app{item.count !== 1 ? 's' : ''}
                            </div>
                        </motion.div>
                        <span className="text-xs text-dark-400 transform -rotate-45 origin-top-left mt-1">
                            {item.month.slice(5)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const CandidateAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getCandidateAnalytics();
                setAnalytics(data);
            } catch (err) {
                console.error('Failed to load analytics:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    if (isLoading) return <Loading text="Loading analytics..." />;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-8">
                    <h1 className="text-2xl font-heading font-bold text-dark-50">My Analytics</h1>
                    <p className="text-dark-400 mt-1">Track your application activity and progress</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={FileText} label="Total Applied" value={analytics?.total_applied ?? 0} color="primary" delay={0.1} />
                    <StatCard icon={CheckCircle} label="Approved" value={analytics?.total_approved ?? 0} color="green" delay={0.2} />
                    <StatCard icon={Clock} label="Pending" value={analytics?.total_pending ?? 0} color="amber" delay={0.3} />
                    <StatCard icon={XCircle} label="Rejected" value={analytics?.total_rejected ?? 0} color="red" delay={0.4} />
                </div>

                {/* Last Application Date */}
                {analytics?.last_application_date && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-8">
                        <Card className="p-4 flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-primary-400" />
                            <span className="text-sm text-dark-400">Last application:</span>
                            <span className="text-sm font-semibold text-dark-50">
                                {formatDate(analytics.last_application_date)}
                            </span>
                        </Card>
                    </motion.div>
                )}

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {analytics?.status_breakdown && Object.keys(analytics.status_breakdown).length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <h2 className="text-lg font-semibold text-dark-50 mb-4">Status Breakdown</h2>
                            <Card className="p-6">
                                <PieChart data={analytics.status_breakdown} />
                            </Card>
                        </motion.div>
                    )}

                    {analytics?.application_timeline?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                            <h2 className="text-lg font-semibold text-dark-50 mb-4">Application Timeline</h2>
                            <Card className="p-6">
                                <BarChart data={analytics.application_timeline} />
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Empty State */}
                {analytics?.total_applied === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        <Card className="p-12 text-center mt-4">
                            <BarChart3 className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-dark-50 mb-2">No Application Data</h3>
                            <p className="text-dark-400">Start applying to jobs to see your analytics here.</p>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default CandidateAnalytics;
