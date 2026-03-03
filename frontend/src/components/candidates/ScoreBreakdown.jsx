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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Score Breakdown
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.2}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Score Bars */}
                    <div className="space-y-4">
                        {scores.map((score) => {
                            const percent = Math.round((score.value || 0) * 100);
                            const { color, bgColor } = getScoreColor(score.value || 0);
                            return (
                                <div key={score.key}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {score.label}
                                        </span>
                                        <span className={`text-sm font-bold ${color}`}>
                                            {formatScore(score.value)}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className={`h-full rounded-full ${bgColor}`}
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
