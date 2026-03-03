import { motion } from 'framer-motion';
import { Mail, Clock, Calendar, FileText, X } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ScoreBreakdown from './ScoreBreakdown';
import SkillsMatch from './SkillsMatch';
import { formatDate, formatExperience } from '../../utils/formatters';
import { getScoreColor } from '../../utils/helpers';

const CandidateDetails = ({ candidate, jobRequirements, onClose, onStatusChange }) => {
    if (!candidate) return null;

    const score = candidate.score_breakdown?.total_score || 0;
    const { color, label } = getScoreColor(score);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                {(candidate.email?.[0] || '?').toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {candidate.email?.split('@')[0] || 'Candidate'}
                            </h2>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" /> {candidate.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" /> {formatExperience(candidate.experience_years)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className={`text-3xl font-bold ${color}`}>
                            {Math.round(score * 100)}%
                        </div>
                        <Badge variant={score >= 0.6 ? 'success' : score >= 0.4 ? 'warning' : 'danger'}>
                            {label}
                        </Badge>
                    </div>
                </div>

                {/* Status Actions */}
                {onStatusChange && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
                        <Button variant="primary" size="sm" onClick={() => onStatusChange('shortlisted')}>
                            Shortlist
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => onStatusChange('under_review')}>
                            Under Review
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => onStatusChange('rejected')}>
                            Reject
                        </Button>
                    </div>
                )}
            </Card>

            {/* Score Breakdown */}
            <ScoreBreakdown scoreBreakdown={candidate.score_breakdown} />

            {/* Skills Match */}
            <SkillsMatch
                matchedSkills={candidate.score_breakdown?.matched_skills || []}
                requiredSkills={jobRequirements}
            />

            {/* Resume Text */}
            {candidate.extracted_text && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Extracted Resume
                    </h3>
                    <div className="bg-gray-50 dark:bg-dark-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                            {candidate.extracted_text}
                        </pre>
                    </div>
                </Card>
            )}
        </motion.div>
    );
};

export default CandidateDetails;
