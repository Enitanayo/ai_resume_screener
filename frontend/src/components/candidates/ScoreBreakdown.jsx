import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import { formatScore } from '../../utils/formatters';
import { getScoreColor } from '../../utils/helpers';

const ScoreBreakdown = ({ scoreBreakdown }) => {
    if (!scoreBreakdown) return null;

    const scores = [
        { label: 'Overall', key: 'total_score', value: scoreBreakdown.total_score },
        { label: 'Skills', key: 'skills_semantic_score', value: scoreBreakdown.skills_semantic_score },
        { label: 'Context', key: 'context_score', value: scoreBreakdown.context_score },
        { label: 'Keywords', key: 'keyword_score', value: scoreBreakdown.keyword_score },
    ];

    const radarData = scores.filter(s => s.key !== 'total_score').map((s) => ({
        subject: s.label,
        score: Math.round((s.value || 0) * 100),
        fullMark: 100,
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="p-6">
                <h3 className="text-lg font-heading font-semibold text-dark-50 mb-6">
                    Score Breakdown
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    tick={{ fill: '#4B5563', fontSize: 10 }}
                                    axisLine={false}
                                />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Score Bars */}
                    <div className="space-y-4">
                        {scores.map((score) => {
                            const percent = Math.round((score.value || 0) * 100);
                            const scoreInfo = getScoreColor(score.value || 0);

                            // Map score info to our theme colors
                            const barColor = score.key === 'total_score'
                                ? 'bg-gradient-to-r from-indigo-500 to-blue-500'
                                : scoreInfo.label === 'Excellent' || scoreInfo.label === 'Good'
                                    ? 'bg-emerald-500'
                                    : scoreInfo.label === 'Average'
                                        ? 'bg-amber-500'
                                        : 'bg-red-500';

                            return (
                                <div key={score.key}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-medium text-dark-300">
                                            {score.label}
                                        </span>
                                        <span className={`text-sm font-bold font-mono ${score.key === 'total_score' ? 'text-indigo-400' :
                                                scoreInfo.label === 'Excellent' ? 'text-emerald-400' :
                                                    'text-dark-50'
                                            }`}>
                                            {formatScore(score.value)}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className={`h-full rounded-full ${barColor}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default ScoreBreakdown;
