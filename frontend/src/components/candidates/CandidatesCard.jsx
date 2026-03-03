import { motion } from 'framer-motion';
import { Mail, Clock, Award } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatScore, formatExperience, formatDate } from '../../utils/formatters';
import { getScoreColor } from '../../utils/helpers';

const CandidatesCard = ({ candidate, onClick, rank }) => {
    const score = candidate.score_breakdown?.total_score || 0;
    const { color, label } = getScoreColor(score);
    const percentage = Math.round(score * 100);

    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Card hover className="p-5 cursor-pointer" onClick={() => onClick?.(candidate)}>
                <div className="flex items-start gap-4">
                    {/* Rank */}
                    {rank && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30
              flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
                            {rank}
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {candidate.email?.split('@')[0] || 'Candidate'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5" />
                                    {candidate.email || 'N/A'}
                                </p>
                            </div>

                            {/* Score circle */}
                            <div className="flex-shrink-0 text-center">
                                <div className={`text-2xl font-bold ${color}`}>
                                    {percentage}%
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatExperience(candidate.experience_years)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                {candidate.score_breakdown?.matched_skills?.length || 0} skills matched
                            </span>
                        </div>

                        {/* Matched skills */}
                        {candidate.score_breakdown?.matched_skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                                {candidate.score_breakdown.matched_skills.slice(0, 5).map((skill) => (
                                    <Badge key={skill} variant="success" size="sm">{skill}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default CandidatesCard;
