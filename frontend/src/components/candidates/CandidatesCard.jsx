import { motion } from 'framer-motion';
import { Mail, Clock, Award, ChevronRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatScore, formatExperience, formatDate } from '../../utils/formatters';
import { getScoreColor } from '../../utils/helpers';

const CandidatesCard = ({ candidate, onClick, rank }) => {
    // Correctly handle different possible field names from backend
    const score = candidate.total_weighted_score || candidate.score_breakdown?.total_score || 0;
    const { color, label } = getScoreColor(score);
    const percentage = Math.round(score * 100);
    const name = candidate.full_name || (candidate.first_name ? `${candidate.first_name} ${candidate.last_name || ''}` : null) || candidate.email?.split('@')[0] || 'Candidate';

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Card hover className="p-5 cursor-pointer relative overflow-hidden group" onClick={() => onClick?.(candidate)}>
                {/* Subtle gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-start gap-4 relative z-10">
                    {/* Rank Badge */}
                    {rank && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20
              flex items-center justify-center text-sm font-bold text-indigo-400 font-mono">
                            {rank}
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="text-base font-bold text-dark-50 truncate group-hover:text-primary-400 transition-colors">
                                    {name}
                                </h3>
                                <p className="text-sm text-dark-400 flex items-center gap-1.5 mt-0.5">
                                    <Mail className="w-3.5 h-3.5 text-dark-500" />
                                    <span className="truncate">{candidate.email || 'N/A'}</span>
                                </p>
                            </div>

                            {/* Score display */}
                            <div className="flex-shrink-0 text-right">
                                <div className={`text-2xl font-bold font-mono ${percentage >= 80 ? 'text-emerald-400' :
                                        percentage >= 60 ? 'text-indigo-400' :
                                            percentage >= 40 ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                    {percentage}%
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-dark-500">{label}</span>
                            </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 mt-4 py-2 border-y border-white/[0.04]">
                            <div className="flex items-center gap-1.5 text-xs text-dark-400">
                                <Clock className="w-3.5 h-3.5 text-indigo-400/70" />
                                <span>{formatExperience(candidate.experience_years)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-dark-400">
                                <Award className="w-3.5 h-3.5 text-emerald-400/70" />
                                <span>{candidate.parsed_skills?.length || 0} skills</span>
                            </div>
                        </div>

                        {/* Skills Preview */}
                        {candidate.parsed_skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-4">
                                {candidate.parsed_skills.slice(0, 4).map((skill) => (
                                    <Badge key={skill} variant="indigo" size="sm" className="bg-indigo-500/5 border-indigo-500/10">
                                        {skill}
                                    </Badge>
                                ))}
                                {candidate.parsed_skills.length > 4 && (
                                    <span className="text-[10px] text-dark-500 flex items-center ml-1">
                                        +{candidate.parsed_skills.length - 4} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Visual indicator corner */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                </div>
            </Card>
        </motion.div>
    );
};

export default CandidatesCard;
