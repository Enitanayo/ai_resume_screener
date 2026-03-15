import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Search, Star, Award, Mail, FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { getJobById, getCandidatesByJob, getJobAnalytics } from '../../services/api';
import { getScoreColor } from '../../utils/helpers';
import { formatDate } from '../../utils/formatters';

const CandidatesView = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobData, candidatesData] = await Promise.all([
                    getJobById(jobId),
                    getCandidatesByJob(jobId),
                ]);
                setJob(jobData);
                setCandidates(candidatesData || []);

                // Try to fetch analytics (may fail for new jobs)
                try {
                    const analyticsData = await getJobAnalytics(jobId);
                    setAnalytics(analyticsData);
                } catch {
                    // Analytics not available yet — that's fine
                }
            } catch (err) {
                console.error('Failed to load candidates:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [jobId]);

    const filtered = candidates.filter((c) => {
        const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
        return fullName.includes(search.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(search.toLowerCase());
    });

    if (isLoading) return <DashboardLayout><Loading text="Loading candidates..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} className="mb-6">
                    Back
                </Button>

                {/* Job Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-heading font-bold text-dark-50 mb-1">
                        {job?.job_title || 'Job'}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-dark-400">
                        <Badge variant={job?.processing_status === 'ready' ? 'success' : 'warning'} dot size="sm">
                            {job?.processing_status || 'Processing'}
                        </Badge>
                        <span>{candidates.length} candidate{candidates.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Analytics Summary */}
                {analytics && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-blue-500/10">
                                    <Users className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-dark-400">Total Applicants</p>
                                    <p className="text-lg font-bold text-dark-50 font-mono">{analytics.total_applicants}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-500/10">
                                    <Award className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-dark-400">Avg Score</p>
                                    <p className="text-lg font-bold text-dark-50 font-mono">
                                        {(analytics.average_score * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div>
                                <p className="text-xs text-dark-400 mb-2">Top Skills</p>
                                <div className="flex flex-wrap gap-1">
                                    {(analytics.top_skills || []).slice(0, 5).map((skill) => (
                                        <Badge key={skill} variant="primary" size="sm">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Search */}
                <div className="mb-6">
                    <Input
                        icon={Search}
                        placeholder="Search candidates by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Candidate List */}
                {filtered.length > 0 ? (
                    <div className="space-y-3">
                        {filtered.map((candidate, index) => {
                            const score = candidate.total_weighted_score;
                            const scoreInfo = score != null ? getScoreColor(score) : null;

                            return (
                                <motion.div
                                    key={candidate.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Card
                                        hover
                                        className="p-5 cursor-pointer"
                                        onClick={() => setSelectedCandidate(
                                            selectedCandidate?.id === candidate.id ? null : candidate
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 min-w-0">
                                                {/* Rank */}
                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600/80 to-blue-500/80 flex items-center justify-center text-sm font-bold text-white">
                                                    {index + 1}
                                                </div>

                                                {/* Info */}
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold text-dark-50 truncate">
                                                        {candidate.first_name} {candidate.last_name}
                                                    </h3>
                                                    <p className="text-xs text-dark-400 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {candidate.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                {scoreInfo ? (
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold font-mono text-emerald-400">
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
                                                ) : (
                                                    <Badge variant="neutral" size="sm">Pending</Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {selectedCandidate?.id === candidate.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-4 pt-4 border-t border-white/[0.06]"
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Score Breakdown */}
                                                    {(candidate.semantic_score != null || candidate.keyword_score != null || candidate.context_score != null) && (
                                                        <div>
                                                            <p className="text-xs font-medium text-dark-400 mb-2">Score Breakdown</p>
                                                            <div className="space-y-1.5">
                                                                {candidate.semantic_score != null && (
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-dark-400">Semantic</span>
                                                                        <span className="font-medium text-dark-50 font-mono">
                                                                            {(candidate.semantic_score * 100).toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {candidate.keyword_score != null && (
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-dark-400">Keyword</span>
                                                                        <span className="font-medium text-dark-50 font-mono">
                                                                            {(candidate.keyword_score * 100).toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {candidate.context_score != null && (
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-dark-400">Context</span>
                                                                        <span className="font-medium text-dark-50 font-mono">
                                                                            {(candidate.context_score * 100).toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Skills */}
                                                    {candidate.parsed_skills && candidate.parsed_skills.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-dark-400 mb-2">Skills Found</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {candidate.parsed_skills.map((skill) => (
                                                                    <Badge key={skill} variant="primary" size="sm">{skill}</Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Matched Skills */}
                                                    {candidate.matched_skills && candidate.matched_skills.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-dark-400 mb-2">Matched Skills</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {candidate.matched_skills.map((skill) => (
                                                                    <Badge key={skill} variant="success" size="sm">{skill}</Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-xs text-dark-500 mt-3">
                                                    Applied: {formatDate(candidate.applied_at)}
                                                </p>
                                            </motion.div>
                                        )}
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <Users className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-dark-50 mb-2">
                            No candidates yet
                        </h3>
                        <p className="text-dark-400">
                            {candidates.length === 0
                                ? 'No one has applied to this job yet.'
                                : 'No candidates match your search.'}
                        </p>
                    </Card>
                )}
            </motion.div>
        </DashboardLayout>
    );
};

export default CandidatesView;
