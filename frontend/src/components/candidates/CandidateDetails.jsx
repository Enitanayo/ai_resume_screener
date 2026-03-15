import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, FileText, Copy, CheckCircle, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { showToast } from '../common/Toast';
import { getScoreColor } from '../../utils/helpers';

const CandidateDetails = ({ candidate, jobRequirements, onClose }) => {
    const [showFullResume, setShowFullResume] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!candidate) return null;

    const fullName = `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Unknown Candidate';
    const score = candidate.total_weighted_score;
    const scoreInfo = score != null ? getScoreColor(score) : null;

    const handleCopyResume = () => {
        const text = candidate.parsed_resume_text || candidate.resume_text || '';
        if (text) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            showToast.success('Resume text copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
                    {fullName[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-dark-50">{fullName}</h2>
                    <div className="flex items-center gap-3 text-sm text-dark-400 mt-0.5">
                        {candidate.email && (
                            <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" /> {candidate.email}
                            </span>
                        )}
                    </div>
                </div>

                {/* Score display */}
                {scoreInfo && (
                    <div className="text-center px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-2xl font-bold font-mono text-emerald-400">
                            {(score * 100).toFixed(1)}%
                        </p>
                        <Badge variant={
                            scoreInfo.label === 'Excellent' ? 'success' :
                                scoreInfo.label === 'Good' ? 'primary' :
                                    scoreInfo.label === 'Average' ? 'warning' : 'danger'
                        } size="sm">
                            {scoreInfo.label}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Score Breakdown */}
            {(candidate.semantic_score != null || candidate.keyword_score != null) && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <h3 className="text-sm font-semibold text-dark-200 mb-3">Score Breakdown</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {candidate.semantic_score != null && (
                            <ScoreItem label="Semantic" value={candidate.semantic_score} color="bg-primary-500" />
                        )}
                        {candidate.keyword_score != null && (
                            <ScoreItem label="Keyword" value={candidate.keyword_score} color="bg-blue-500" />
                        )}
                        {candidate.context_score != null && (
                            <ScoreItem label="Context" value={candidate.context_score} color="bg-purple-500" />
                        )}
                    </div>
                </div>
            )}

            {/* Skills */}
            {candidate.parsed_skills && candidate.parsed_skills.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-dark-200 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {candidate.parsed_skills.map((skill) => {
                            const isMatched = candidate.matched_skills?.includes(skill);
                            return (
                                <Badge
                                    key={skill}
                                    variant={isMatched ? 'success' : 'primary'}
                                    size="sm"
                                >
                                    {isMatched && <CheckCircle className="w-3 h-3" />}
                                    {skill}
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Resume Text */}
            {(candidate.parsed_resume_text || candidate.resume_text) && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Resume Text
                        </h3>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={copied ? CheckCircle : Copy}
                                onClick={handleCopyResume}
                            >
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={showFullResume ? ChevronUp : ChevronDown}
                                onClick={() => setShowFullResume(!showFullResume)}
                            >
                                {showFullResume ? 'Collapse' : 'Expand'}
                            </Button>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl bg-dark-900 border border-white/[0.06] font-mono text-xs text-dark-300 leading-relaxed overflow-auto custom-scrollbar ${showFullResume ? 'max-h-96' : 'max-h-32'} transition-all duration-300`}>
                        <pre className="whitespace-pre-wrap">
                            {candidate.parsed_resume_text || candidate.resume_text}
                        </pre>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// Score item sub-component
const ScoreItem = ({ label, value, color }) => {
    const percentage = (value * 100).toFixed(1);
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-dark-400">{label}</span>
                <span className="text-xs font-bold font-mono text-dark-50">{percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
            </div>
        </div>
    );
};

export default CandidateDetails;
