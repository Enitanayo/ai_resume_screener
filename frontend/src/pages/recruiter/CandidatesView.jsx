import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Users, Search, Award, FileText, Calendar, ChevronRight, 
    Trophy, Medal, Mail, Download 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import ResumeBreakdown from '../../components/candidates/ResumeBreakdown';
import { getJobById, getCandidatesByJob, getJobAnalytics } from '../../services/api';
import { formatDate } from '../../utils/formatters';

// Config exactly matching BatchUpload
const medalConfig = {
    0: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: '1st' },
    1: { icon: Medal, color: 'text-dark-300', bg: 'bg-white/[0.04]', border: 'border-white/[0.06]', label: '2nd' },
    2: { icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: '3rd' },
};

const getScoreColorInfo = (percentage) => {
    if (percentage >= 70) return { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'success' };
    if (percentage >= 40) return { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'warning' };
    return { bar: 'bg-red-500', text: 'text-red-400', badge: 'danger' };
};

const CandidatesView = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Batch UI State
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [breakdownCandidate, setBreakdownCandidate] = useState(null);
    const [breakdownRank, setBreakdownRank] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobData, candidatesData] = await Promise.all([
                    getJobById(jobId),
                    getCandidatesByJob(jobId),
                ]);
                setJob(jobData);
                setCandidates(candidatesData || []);

                try {
                    const analyticsData = await getJobAnalytics(jobId);
                    setAnalytics(analyticsData);
                } catch {
                    // Analytics not available yet
                }
            } catch (err) {
                console.error('Failed to load candidates:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [jobId]);

    // Grouping candidates into Batches based on 2-minute time chunks
    const batches = useMemo(() => {
        if (!candidates.length) return [];
        
        // Only include candidates matching search
        const filtered = candidates.filter((c) => {
            const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
            return fullName.includes(search.toLowerCase()) ||
                (c.email || '').toLowerCase().includes(search.toLowerCase());
        });

        // Sort descending by time (newest first)
        const sorted = [...filtered].sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
        
        const grouped = [];
        let currentBatch = [];

        sorted.forEach(c => {
            if (currentBatch.length === 0) {
                currentBatch.push(c);
            } else {
                const lastTime = new Date(currentBatch[currentBatch.length - 1].applied_at).getTime();
                const cTime = new Date(c.applied_at).getTime();
                
                // If applied within 2 minutes (120,000 ms), group together
                if (Math.abs(lastTime - cTime) <= 120000) {
                    currentBatch.push(c);
                } else {
                    grouped.push(currentBatch);
                    currentBatch = [c];
                }
            }
        });
        if (currentBatch.length > 0) grouped.push(currentBatch);

        const totalBatches = grouped.length;
        
        return grouped.map((batch, index) => {
            // Sort each batch specifically by score descending for the leaderboard
            const rankedBatch = [...batch].sort((a,b) => (b.total_weighted_score || 0) - (a.total_weighted_score || 0));
            return {
                id: totalBatches - index, // Oldest is Batch 1
                candidates: rankedBatch,
                timestamp: batch[0].applied_at,
                isPending: batch.some(c => c.processing_status === 'pending' || c.processing_status === 'processing')
            };
        });
    }, [candidates, search]);

    const handleViewBreakdown = (result, index) => {
        // Map backend properties (total_weighted_score) to ResumeBreakdown expectations (match_percentage, score_breakdown)
        const mappedCandidate = {
            ...result,
            candidate_id: result.id,
            candidate_name: `${result.first_name} ${result.last_name}`,
            match_percentage: (result.total_weighted_score || 0) * 100,
            score_breakdown: {
                semantic_similarity: result.semantic_score,
                context_score: result.context_score,
                keyword_match: result.keyword_score
            }
        };
        setBreakdownCandidate(mappedCandidate);
        setBreakdownRank(index + 1);
    };

    if (isLoading) return <DashboardLayout><Loading text="Loading batches..." /></DashboardLayout>;

    const selectedBatch = batches.find(b => b.id === selectedBatchId);

    const downloadPDF = () => {
        if (!selectedBatch || selectedBatch.candidates.length === 0) return;
        const doc = new jsPDF();
        const jobTitle = job?.job_title || job?.title || 'Job';

        doc.setFontSize(18);
        doc.text(`Batch #${selectedBatch.id} Rankings — ${jobTitle}`, 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 28);

        const tableData = selectedBatch.candidates.map((r, i) => [
            `#${i + 1}`,
            `${r.first_name || ''} ${r.last_name || ''}`.trim() || `Candidate ${r.id?.slice(0, 8)}`,
            `${((r.total_weighted_score || 0) * 100).toFixed(1)}%`,
            r.semantic_score != null
                ? `${(r.semantic_score * 100).toFixed(0)}%` : '—',
            r.keyword_score != null
                ? `${(r.keyword_score * 100).toFixed(0)}%` : '—',
        ]);

        autoTable(doc, {
            startY: 34,
            head: [['Rank', 'Candidate', 'Overall Score', 'Semantic Match', 'Keyword Match']],
            body: tableData,
            headStyles: { fillColor: [79, 70, 229] },
            alternateRowStyles: { fillColor: [245, 245, 255] },
            styles: { fontSize: 10 },
        });

        doc.save(`batch_${selectedBatch.id}_rankings_${jobTitle.replace(/\s+/g, '_')}.pdf`);
    };

    const downloadWord = () => {
        if (!selectedBatch || selectedBatch.candidates.length === 0) return;
        const jobTitle = job?.job_title || job?.title || 'Job';
        let html = `<html><head><meta charset="utf-8"><title>Batch #${selectedBatch.id} Rankings - ${jobTitle}</title></head><body>`;
        html += `<h1>Batch #${selectedBatch.id} Rankings — ${jobTitle}</h1>`;
        html += `<p>Generated on ${new Date().toLocaleString()}</p>`;
        html += `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">`;
        html += `<tr style="background:#4f46e5;color:white"><th>Rank</th><th>Candidate</th><th>Overall Score</th><th>Semantic</th><th>Keyword</th></tr>`;
        
        selectedBatch.candidates.forEach((r, i) => {
            const bg = i % 2 === 0 ? '#f5f5ff' : '#ffffff';
            html += `<tr style="background:${bg}">`;
            html += `<td>#${i + 1}</td>`;
            html += `<td>${`${r.first_name || ''} ${r.last_name || ''}`.trim() || `Candidate ${r.id?.slice(0, 8)}`}</td>`;
            html += `<td>${((r.total_weighted_score || 0) * 100).toFixed(1)}%</td>`;
            html += `<td>${r.semantic_score != null ? (r.semantic_score * 100).toFixed(0) + '%' : '—'}</td>`;
            html += `<td>${r.keyword_score != null ? (r.keyword_score * 100).toFixed(0) + '%' : '—'}</td>`;
            html += `</tr>`;
        });
        html += `</table></body></html>`;

        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch_${selectedBatch.id}_rankings_${jobTitle.replace(/\s+/g, '_')}.doc`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header Section */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <Button 
                            variant="ghost" 
                            icon={ArrowLeft} 
                            onClick={() => selectedBatchId ? setSelectedBatchId(null) : navigate(-1)} 
                            className="mb-4"
                        >
                            {selectedBatchId ? `Back to All Batches` : 'Back to Jobs'}
                        </Button>
                        <h1 className="text-2xl font-heading font-bold text-dark-50 mb-1">
                            {job?.job_title || 'Job'} Applications
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-dark-400">
                            <Badge variant={job?.processing_status === 'ready' ? 'success' : 'warning'} dot size="sm">
                                {job?.processing_status || 'Active'}
                            </Badge>
                            <span>{candidates.length} total resume{candidates.length !== 1 ? 's' : ''} uploaded</span>
                        </div>
                    </div>
                </div>

                {/* If Not Viewing a Batch -> Show Batch Grid */}
                {!selectedBatchId ? (
                    <>
                        {/* Analytics Summary */}
                        {analytics && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <Card className="p-4 bg-dark-800/50">
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
                                <Card className="p-4 bg-dark-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-emerald-500/10">
                                            <Award className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-dark-400">Avg Overall Score</p>
                                            <p className="text-lg font-bold text-dark-50 font-mono">
                                                {(analytics.average_score * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-4 bg-dark-800/50">
                                    <div>
                                        <p className="text-xs text-dark-400 mb-2">Most Common Skills Found</p>
                                        <div className="flex flex-wrap gap-1">
                                            {(analytics.top_skills || []).slice(0, 5).map((skill) => (
                                                <Badge key={skill} variant="neutral" size="sm">{skill}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Search */}
                        <div className="mb-6 max-w-md">
                            <Input
                                icon={Search}
                                placeholder="Search all candidates..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* BATCH GRID */}
                        {batches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {batches.map((batch) => (
                                    <Card 
                                        key={`batch-${batch.id}`} 
                                        hover 
                                        className="p-5 cursor-pointer border-white/[0.04]"
                                        onClick={() => setSelectedBatchId(batch.id)}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-primary-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-dark-50">Batch #{batch.id}</h3>
                                                    <p className="text-xs text-dark-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(batch.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                            {batch.isPending ? (
                                                <Badge variant="warning" size="sm">Processing</Badge>
                                            ) : (
                                                <Badge variant="success" size="sm">Ranked</Badge>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-white/[0.04]">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-dark-300">{batch.candidates.length} Resumes</span>
                                                <span className="text-primary-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                    View Rankings <ChevronRight className="w-4 h-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-12 text-center">
                                <Users className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-dark-50 mb-2">No batches found</h3>
                                <p className="text-dark-400">Upload resumes to see them grouped here chronologically.</p>
                            </Card>
                        )}
                    </>
                ) : (
                    /* If A Batch is Selected -> Show Exact Ranked Leaderboard UI */
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        {/* Header with download buttons */}
                        <div className="flex items-center justify-between flex-wrap gap-3 py-4 mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-gradient-to-tr from-primary-600 to-violet-600 shadow-xl shadow-primary-500/20">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                        Batch #{selectedBatch.id} Match Rankings
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedBatch.candidates.length} candidates uploaded {formatDate(selectedBatch.timestamp)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm" icon={Download} onClick={downloadPDF} className="rounded-xl">
                                    PDF
                                </Button>
                                <Button variant="secondary" size="sm" icon={Download} onClick={downloadWord} className="rounded-xl">
                                    Doc
                                </Button>
                            </div>
                        </div>

                        {/* Leaderboard List */}
                        <div className="space-y-3">
                            <AnimatePresence>
                                {selectedBatch.candidates.map((result, index) => {
                                    const medal = medalConfig[index];
                                    const percentage = (result.total_weighted_score || 0) * 100;
                                    const scoreColors = getScoreColorInfo(percentage);
                                    
                                    // if backend is still processing this specific candidate
                                    const isPending = result.processing_status !== 'ready';

                                    return (
                                        <motion.div
                                            key={`candidate-${result.id}`}
                                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: index * 0.08, type: 'spring', stiffness: 100, damping: 15 }}
                                        >
                                            <Card className={`p-5 transition-all duration-500 relative overflow-hidden group
                                                ${medal && !isPending ? 'bg-dark-800/80 backdrop-blur-xl border-white/[0.06] ' + medal.border : 'bg-dark-800 border-white/[0.06]'}
                                                hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1`}>

                                                {/* Background Glow for Top Candidate */}
                                                {index === 0 && !isPending && (
                                                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber-400/10 blur-[60px] rounded-full pointer-events-none" />
                                                )}

                                                <div className="flex items-center gap-5 relative z-10">
                                                    {/* Rank Badge */}
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                                                        ${medal && !isPending ? medal.bg : 'bg-white/[0.04]'}`}>
                                                        {medal && !isPending ? (
                                                            <medal.icon className={`w-6 h-6 ${medal.color}`} />
                                                        ) : (
                                                            <span className="text-lg font-black text-dark-500">{index + 1}</span>
                                                        )}
                                                    </div>

                                                    {/* Name + Progress */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-md font-bold text-dark-50 truncate group-hover:text-primary-400 transition-colors">
                                                                        {result.first_name} {result.last_name}
                                                                    </h4>
                                                                    {medal && !isPending && (
                                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${medal.bg} ${medal.color} ring-1 ring-inset ${medal.border}`}>
                                                                            {medal.label}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
                                                                    <Mail className="w-3 h-3" />
                                                                    {result.email}
                                                                </p>
                                                            </div>

                                                            {isPending ? (
                                                                 <Badge variant="warning" size="sm">Processing</Badge>
                                                            ) : (
                                                                <span className={`text-xl font-black ${scoreColors.text}`}>
                                                                    {percentage.toFixed(0)}<span className="text-[10px] ml-0.5 opacity-70">%</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Progress bar */}
                                                        {!isPending && (
                                                            <div className="w-full bg-white/[0.04] rounded-full h-2.5 p-0.5 overflow-hidden ring-1 ring-inset ring-white/[0.04]">
                                                                <motion.div
                                                                    className={`h-full rounded-full shadow-sm ${scoreColors.bar}`}
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${percentage}%` }}
                                                                    transition={{ delay: index * 0.1 + 0.4, duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* View Button */}
                                                    {!isPending && (
                                                        <div className="ml-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                icon={ChevronRight}
                                                                onClick={() => handleViewBreakdown(result, index)}
                                                                className="rounded-xl hover:bg-primary-500/10 group-hover:translate-x-1 transition-all"
                                                            >
                                                                View
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* Resume Breakdown Modal */}
                <Modal
                    isOpen={!!breakdownCandidate}
                    onClose={() => { setBreakdownCandidate(null); setBreakdownRank(null); }}
                    title="Score Breakdown & Analysis"
                    size="full"
                >
                    <ResumeBreakdown
                        candidate={breakdownCandidate}
                        job={job}
                        rank={breakdownRank}
                        totalCandidates={selectedBatch?.candidates?.length || 0}
                        onClose={() => { setBreakdownCandidate(null); setBreakdownRank(null); }}
                    />
                </Modal>
            </motion.div>
        </DashboardLayout>
    );
};

export default CandidatesView;

