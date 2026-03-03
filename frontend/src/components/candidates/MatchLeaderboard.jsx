import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, ChevronRight } from 'lucide-react';
import Card from '../common/Card';

const medalConfig = {
    0: { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-300 dark:border-amber-600', label: '1st' },
    1: { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/40', border: 'border-gray-300 dark:border-gray-600', label: '2nd' },
    2: { icon: Award, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-600', label: '3rd' },
};

const getScoreColor = (percentage) => {
    if (percentage >= 70) return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', glow: 'shadow-emerald-500/20' };
    if (percentage >= 40) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', glow: 'shadow-amber-500/20' };
    return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400', glow: 'shadow-red-500/20' };
};

const MatchLeaderboard = ({ results = [], onSelectCandidate, candidateMap = {} }) => {
    if (!results.length) {
        return (
            <Card className="p-12 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Match Results</h3>
                <p className="text-gray-500 dark:text-gray-400">Click "Run AI Match" to rank candidates by relevance.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                    <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Match Leaderboard</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{results.length} candidates ranked by relevance</p>
                </div>
            </div>

            {/* Leaderboard */}
            {results.map((result, index) => {
                const medal = medalConfig[index];
                const percentage = result.match_percentage || 0;
                const scoreColors = getScoreColor(percentage);
                const candidateName = candidateMap[result.candidate_id] || `Candidate ${result.candidate_id?.slice(0, 8)}`;

                return (
                    <motion.div
                        key={result.candidate_id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            delay: index * 0.06,
                            type: 'spring',
                            stiffness: 120,
                        }}
                    >
                        <Card
                            hover
                            className={`p-4 cursor-pointer transition-all duration-300 ${medal ? `border-2 ${medal.border}` : ''}`}
                            onClick={() => onSelectCandidate?.(result.candidate_id)}
                        >
                            <div className="flex items-center gap-4">
                                {/* Rank */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${medal ? medal.bg : 'bg-gray-100 dark:bg-dark-700'}`}>
                                    {medal ? (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: index * 0.06 + 0.2, type: 'spring', stiffness: 200 }}
                                        >
                                            <medal.icon className={`w-6 h-6 ${medal.color}`} />
                                        </motion.div>
                                    ) : (
                                        <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
                                            {index + 1}
                                        </span>
                                    )}
                                </div>

                                {/* Candidate Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {candidateName}
                                        </h4>
                                        {medal && (
                                            <span className={`text-xs font-bold ${medal.color}`}>{medal.label}</span>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2.5 overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${scoreColors.bar}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: index * 0.06 + 0.3, duration: 0.8, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>

                                {/* Score */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.06 + 0.5 }}
                                    className="flex items-center gap-2 flex-shrink-0"
                                >
                                    <span className={`text-xl font-bold ${scoreColors.text}`}>
                                        {percentage.toFixed(1)}%
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </motion.div>
                            </div>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default MatchLeaderboard;
