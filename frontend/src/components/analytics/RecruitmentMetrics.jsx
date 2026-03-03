import { motion } from 'framer-motion';
import { Briefcase, Users, TrendingUp, Award } from 'lucide-react';
import StatsCard from './StatsCard';

const RecruitmentMetrics = ({ jobs = [], candidates = [] }) => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.is_active).length;
    const totalCandidates = candidates.length;
    const avgScore = candidates.length > 0
        ? Math.round(
            (candidates.reduce((sum, c) => sum + (c.score_breakdown?.total_score || 0), 0) /
                candidates.length) * 100
        )
        : 0;

    const metrics = [
        { label: 'Total Jobs', value: totalJobs, icon: Briefcase, color: 'primary' },
        { label: 'Active Jobs', value: activeJobs, icon: TrendingUp, color: 'green' },
        { label: 'Total Candidates', value: totalCandidates, icon: Users, color: 'blue' },
        { label: 'Avg. Match Score', value: `${avgScore}%`, icon: Award, color: 'purple' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
                <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <StatsCard {...metric} />
                </motion.div>
            ))}
        </div>
    );
};

export default RecruitmentMetrics;
