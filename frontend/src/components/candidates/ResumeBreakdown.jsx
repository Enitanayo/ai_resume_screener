import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy, Medal, Award, Download, FileText, X, CheckCircle, XCircle,
    BarChart3, Zap, Brain, Search, ArrowDown, Briefcase
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { showToast } from '../common/Toast';
import { downloadResume } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// =============================================================================
// Medal & Score config (mirrors BatchUpload)
// =============================================================================
const medalConfig = {
    1: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: '1st Place', gradient: 'from-amber-500 to-yellow-600' },
    2: { icon: Medal, color: 'text-gray-300', bg: 'bg-white/[0.04]', border: 'border-white/[0.06]', label: '2nd Place', gradient: 'from-gray-400 to-gray-500' },
    3: { icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: '3rd Place', gradient: 'from-orange-500 to-amber-600' },
};

const getScoreColor = (pct) => {
    if (pct >= 70) return 'text-emerald-400';
    if (pct >= 40) return 'text-amber-400';
    return 'text-red-400';
};

const getBarColor = (pct) => {
    if (pct >= 70) return 'bg-emerald-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-500';
};

// =============================================================================
// Main Component
// =============================================================================
const ResumeBreakdown = ({
    candidate,       // ranked result object from matchCandidates
    job,             // full job object
    rank,            // 1-based rank number
    totalCandidates, // how many candidates total
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState('breakdown'); // 'breakdown' | 'comparison'

    if (!candidate || !job) return null;

    const medal = medalConfig[rank];
    const overallPct = candidate.match_percentage || 0;
    const semantic = candidate.score_breakdown?.semantic_similarity;
    const context = candidate.score_breakdown?.context_score;
    const keyword = candidate.score_breakdown?.keyword_match;

    const jobSkills = job.required_skills || [];
    const matchedSkills = candidate.matched_skills || [];
    const parsedSkills = candidate.parsed_skills || [];
    const unmatchedSkills = jobSkills.filter(s => !matchedSkills.map(m => m.toLowerCase()).includes(s.toLowerCase()));

    // ---- Highlighted Resume Text Logic ----
    const highlightedResumeContent = useMemo(() => {
        const text = candidate.raw_text || '';
        if (!text) return null;

        // Build a set of matched skill terms for highlighting
        const matchTerms = matchedSkills.map(s => s.toLowerCase());
        const allJobTerms = jobSkills.map(s => s.toLowerCase());

        // Create a regex that matches any of the skill terms
        if (matchTerms.length === 0 && allJobTerms.length === 0) {
            return [{ text, type: 'normal' }];
        }

        // Combine matched and unmatched for highlighting
        const escapedMatched = matchTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const escapedAll = allJobTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const allEscaped = [...new Set([...escapedMatched, ...escapedAll])];

        if (allEscaped.length === 0) return [{ text, type: 'normal' }];

        const regex = new RegExp(`(${allEscaped.join('|')})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, i) => {
            const lower = part.toLowerCase();
            if (matchTerms.includes(lower)) {
                return { text: part, type: 'matched', key: i };
            }
            if (allJobTerms.includes(lower)) {
                return { text: part, type: 'required', key: i };
            }
            return { text: part, type: 'normal', key: i };
        });
    }, [candidate.raw_text, matchedSkills, jobSkills]);

    // ---- Score weights explanation ----
    const scoreWeights = [
        {
            label: 'Semantic Skills Match',
            weight: 60,
            rawScore: semantic,
            contribution: semantic != null ? (semantic * 0.6 * 100) : null,
            icon: Brain,
            color: 'bg-violet-500',
            lightColor: 'text-violet-400',
            description: 'Scientific concept matching (e.g., "Aviator" ≈ "Pilot") using high-dimensional Vector Embeddings. Not just keyword hunting.',
        },
        {
            label: 'Context Match',
            weight: 20,
            rawScore: context,
            contribution: context != null ? (context * 0.2 * 100) : null,
            icon: FileText,
            lightColor: 'text-blue-400',
            color: 'bg-blue-500',
            description: 'Analyzes if the overall career trajectory and industry matches the job scope.',
        },
        {
            label: 'Keyword Match',
            weight: 20,
            rawScore: keyword,
            contribution: keyword != null ? (keyword * 0.2 * 100) : null,
            icon: Search,
            lightColor: 'text-emerald-400',
            color: 'bg-emerald-500',
            description: 'Exact character-for-character matching of critical skills found in the text.',
        },
    ];

    // ---- Handlers ----
    const handleDownloadPlainResume = async () => {
        try {
            const jobId = job.$id || job.id;
            await downloadResume(jobId, candidate.candidate_id);
            showToast.success('Resume downloaded!');
        } catch {
            showToast.error('Failed to download resume');
        }
    };

    const handleDownloadWithExplanation = () => {
        try {
            const doc = new jsPDF();
            const jobTitle = job.job_title || job.title || 'Job';
            const candidateName = candidate.candidate_name || 'Candidate';
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 14;
            const contentWidth = pageWidth - margin * 2;
            const lineHeight = 5;

            // Helper: ensure enough space or add page
            const checkPageSpace = (needed, currentY) => {
                if (currentY + needed > pageHeight - 15) {
                    doc.addPage();
                    return 20;
                }
                return currentY;
            };

            // ============================================================
            // PAGE 1: SCORE EXPLANATION (SUMMARY)
            // ============================================================
            
            // Header (Minimalist - No background)
            doc.setFontSize(22);
            doc.setTextColor(40, 40, 40);
            doc.setFont(undefined, 'bold');
            doc.text('AI Resume Analysis Report', margin, 18);
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(80, 80, 80);
            doc.text(`${candidateName}  |  Rank #${rank} of ${totalCandidates}  |  ${overallPct.toFixed(1)}% Match`, margin, 28);
            doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 34);

            let y = 52;
            
            // Job Position
            doc.setTextColor(40);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text('Applying for Position:', margin, y);
            doc.setFont(undefined, 'normal');
            doc.text(jobTitle, margin + 45, y);
            y += 12;

            // --- Score Component Table ---
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Score Breakdown', margin, y);
            y += 4;

            const breakdownData = scoreWeights.map(sw => [
                sw.label,
                `${sw.weight}%`,
                sw.rawScore != null ? `${(sw.rawScore * 100).toFixed(1)}%` : '—',
                sw.contribution != null ? `${sw.contribution.toFixed(1)}%` : '—',
            ]);
            breakdownData.push([
                { content: 'TOTAL MATCH PERCENTAGE', styles: { fontStyle: 'bold' } },
                '100%',
                '',
                { content: `${overallPct.toFixed(1)}%`, styles: { fontStyle: 'bold', textColor: [0, 0, 0] } },
            ]);

            autoTable(doc, {
                startY: y,
                head: [['Component', 'Weight', 'Raw Score', 'Weighted Contribution']],
                body: breakdownData,
                headStyles: { fillColor: [220, 220, 220], textColor: [40, 40, 40], fontSize: 10 },
                alternateRowStyles: { fillColor: [248, 248, 248] },
                styles: { fontSize: 10, cellPadding: 4, textColor: [40, 40, 40] },
                columnStyles: { 0: { cellWidth: 70 } },
                margin: { left: margin, right: margin },
            });

            y = doc.lastAutoTable.finalY + 12;

            // --- Ranking Explanation ---
            y = checkPageSpace(30, y);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`Why Rank #${rank}?`, margin, y);
            y += 7;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(60);
            const explanation = getRankExplanation(rank, overallPct, semantic, context, keyword, matchedSkills.length, jobSkills.length);
            const explLines = doc.splitTextToSize(explanation, contentWidth);
            for (const line of explLines) {
                y = checkPageSpace(6, y);
                doc.text(line, margin, y);
                y += lineHeight;
            }
            y += 8;

            // --- Skills List ---
            y = checkPageSpace(20, y);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(40);
            doc.text(`Required Skills Status`, margin, y);
            y += 5;

            const skillsData = [];
            matchedSkills.forEach(s => skillsData.push([s, 'MATCHED', 'Found in resume content']));
            unmatchedSkills.forEach(s => skillsData.push([s, 'NOT FOUND', 'Missing from resume content']));

            autoTable(doc, {
                startY: y,
                head: [['Skill', 'Status', 'Details']],
                body: skillsData,
                headStyles: { fillColor: [230, 230, 230], textColor: [40, 40, 40], fontSize: 10 },
                styles: { fontSize: 10, cellPadding: 3, textColor: [40, 40, 40] },
                margin: { left: margin, right: margin },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 1) {
                        data.cell.styles.fontStyle = 'bold';
                        if (data.cell.raw === 'MATCHED') {
                            data.cell.styles.textColor = [0, 0, 0];
                        } else {
                            data.cell.styles.textColor = [120, 120, 120];
                        }
                    }
                },
            });

            y = doc.lastAutoTable.finalY + 15;

            // --- Job Description ---
            y = checkPageSpace(30, y);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(40);
            doc.text('Original Job Description Reference', margin, y);
            y += 7;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(60);
            const jdText = job.job_description || '';
            const jdLines = doc.splitTextToSize(jdText, contentWidth);
            for (const line of jdLines) {
                y = checkPageSpace(6, y);
                doc.text(line, margin, y);
                y += lineHeight;
            }

            doc.save(`${candidateName.replace(/\s+/g, '_')}_AI_Analysis_Explanations.pdf`);
            showToast.success('Analysis PDF downloaded!');
        } catch (err) {
            console.error(err);
            showToast.error('Failed to generate PDF');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    {/* Rank badge */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${medal ? `bg-gradient-to-br ${medal.gradient}` : 'bg-white/[0.06]'}`}>
                        {medal ? (
                            <medal.icon className="w-8 h-8 text-white" />
                        ) : (
                            <span className="text-2xl font-black text-dark-400">#{rank}</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-dark-50 font-heading">
                            {candidate.candidate_name || 'Unknown Candidate'}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`text-sm font-semibold ${medal ? medal.color : 'text-dark-400'}`}>
                                Rank #{rank} of {totalCandidates}
                            </span>
                            <span className={`text-2xl font-black font-mono ${getScoreColor(overallPct)}`}>
                                {overallPct.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Download buttons */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={Download}
                        onClick={handleDownloadWithExplanation}
                        className="rounded-xl"
                    >
                        Explanation
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        icon={Download}
                        onClick={handleDownloadPlainResume}
                        className="rounded-xl"
                    >
                        Plain Resume
                    </Button>
                </div>
            </div>

            {/* ─── Tab Switcher ─── */}
            <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <TabButton active={activeTab === 'breakdown'} onClick={() => setActiveTab('breakdown')} icon={BarChart3} label="Score Breakdown" />
                <TabButton active={activeTab === 'comparison'} onClick={() => setActiveTab('comparison')} icon={FileText} label="Resume vs Job Description" />
            </div>

            {/* ─── TAB: Score Breakdown ─── */}
            {activeTab === 'breakdown' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                    {/* Overall score ring + summary */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Score Ring */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center">
                            <ScoreRing percentage={overallPct} size={160} />
                            <p className="text-sm text-dark-400 mt-4 text-center">Overall Match Score</p>
                            <p className="text-xs text-dark-500 mt-1 text-center max-w-[220px]">
                                Computed as a weighted combination of semantic, context, and keyword matching
                            </p>
                        </div>

                        {/* Weight breakdown */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                            <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary-400" />
                                Score Components
                            </h3>
                            {scoreWeights.map((sw, i) => (
                                <ScoreWeightBar key={i} {...sw} />
                            ))}
                            <div className="pt-3 border-t border-white/[0.06]">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-dark-200">Total Score</span>
                                    <span className={`text-lg font-black font-mono ${getScoreColor(overallPct)}`}>
                                        {overallPct.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Why this rank? */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-950/40 to-violet-950/40 border border-primary-500/10">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-primary-300 flex items-center gap-2">
                                    <Trophy className="w-4 h-4" />
                                    Why Rank #{rank}?
                                </h3>
                                <p className="text-sm text-dark-300 leading-relaxed">
                                    {getRankExplanation(rank, overallPct, semantic, context, keyword, matchedSkills.length, jobSkills.length)}
                                </p>
                            </div>
                            <div className="px-5 py-4 rounded-2xl bg-primary-500/10 border border-primary-500/30 text-xs text-dark-200 max-w-[280px] shadow-lg shadow-primary-500/5">
                                <div className="flex items-center gap-2 mb-2 text-primary-400 font-bold uppercase tracking-wider text-[10px]">
                                    <Brain className="w-3.5 h-3.5" />
                                    <span>AI Semantic Logic Proof</span>
                                </div>
                                <p className="leading-relaxed">
                                    The system uses Vector Embeddings to map phrases into multi-dimensional space. Scores are derived from Cosine Similarity math, not random chance.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Evidence & Proof Table */}
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                        <h3 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400" />
                            Evidence & Proof of Skills
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="text-dark-400 font-bold border-b border-white/[0.06]">
                                    <tr>
                                        <th className="pb-2 pr-4">Job Requirement</th>
                                        <th className="pb-2 pr-4">Resume Evidence Found</th>
                                        <th className="pb-2 text-right">Semantic Proof</th>
                                    </tr>
                                </thead>
                                <tbody className="text-dark-300">
                                    {jobSkills.map((skill, idx) => {
                                        const isMatched = matchedSkills.map(m => m.toLowerCase()).includes(skill.toLowerCase());
                                        return (
                                            <tr key={idx} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01]">
                                                <td className="py-3 pr-4 font-medium text-dark-100">{skill}</td>
                                                <td className="py-3 pr-4 italic">
                                                    {isMatched ? (
                                                        <span className="text-emerald-400/80">Found in verified skill segments</span>
                                                    ) : (
                                                        <span className="text-red-400/60">No high-confidence match detected</span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <Badge variant={isMatched ? 'success' : 'danger'} size="sm">
                                                        {isMatched ? 'Verified' : 'Missing'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Skills Match */}
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                        <h3 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            Skills Match Analysis
                            <span className="text-xs text-dark-500 font-normal ml-auto">
                                {matchedSkills.length}/{jobSkills.length} matched
                            </span>
                        </h3>

                        {/* Matched skills */}
                        {matchedSkills.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-emerald-400 font-medium mb-2 uppercase tracking-wider">✓ Found in Resume</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {matchedSkills.map(skill => (
                                        <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                            <CheckCircle className="w-3 h-3" />
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Unmatched skills */}
                        {unmatchedSkills.length > 0 && (
                            <div>
                                <p className="text-xs text-red-400 font-medium mb-2 uppercase tracking-wider">✗ Not Found</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {unmatchedSkills.map(skill => (
                                        <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                                            <XCircle className="w-3 h-3" />
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Candidate's additional skills */}
                        {parsedSkills.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/[0.06]">
                                <p className="text-xs text-dark-400 font-medium mb-2 uppercase tracking-wider">All Candidate Skills (AI-Extracted)</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {parsedSkills.map(skill => {
                                        const isMatched = matchedSkills.map(m => m.toLowerCase()).includes(skill.toLowerCase());
                                        return (
                                            <span key={skill} className={`px-2 py-0.5 rounded-md text-xs font-medium ${isMatched ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-dark-400'}`}>
                                                {skill}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* ─── TAB: Resume vs Job Description ─── */}
            {activeTab === 'comparison' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-6 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                        <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 border border-emerald-500/50" />
                            <span className="text-dark-200 font-semibold">Direct Evidence (Green)</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded bg-amber-500/30 border border-amber-500/50" />
                            <span className="text-dark-200 font-semibold">Semantic Inference (Amber)</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded bg-red-500/10 border border-red-500/30" />
                            <span className="text-dark-400 italic">No Evidence Found (Red)</span>
                        </span>
                        <div className="ml-auto flex items-center gap-2 text-[10px] text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20">
                            <Brain className="w-3 h-3" />
                            Powered by Vector Similarity Logic
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Resume panel */}
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary-400" />
                                <h3 className="text-sm font-semibold text-dark-200">Candidate Resume</h3>
                            </div>
                            <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {highlightedResumeContent ? (
                                    <p className="text-xs text-dark-300 leading-relaxed whitespace-pre-wrap font-mono">
                                        {highlightedResumeContent.map((part, i) => {
                                            if (part.type === 'matched') {
                                                return (
                                                    <span
                                                        key={i}
                                                        className="bg-emerald-500/20 text-emerald-300 px-0.5 rounded border-b border-emerald-500/40"
                                                        title={`✓ Matched required skill: "${part.text}"`}
                                                    >
                                                        {part.text}
                                                    </span>
                                                );
                                            }
                                            if (part.type === 'required') {
                                                return (
                                                    <span
                                                        key={i}
                                                        className="bg-amber-500/20 text-amber-300 px-0.5 rounded border-b border-amber-500/40"
                                                        title={`Required skill: "${part.text}" — found but not matched`}
                                                    >
                                                        {part.text}
                                                    </span>
                                                );
                                            }
                                            return <span key={i}>{part.text}</span>;
                                        })}
                                    </p>
                                ) : (
                                    <p className="text-sm text-dark-500 italic">No parsed resume text available</p>
                                )}
                            </div>
                        </div>

                        {/* Job Description panel */}
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-violet-400" />
                                <h3 className="text-sm font-semibold text-dark-200">Job Description</h3>
                            </div>
                            <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar space-y-4">
                                <div>
                                    <h4 className="text-xs text-dark-500 uppercase tracking-wider mb-1 font-semibold">Job Title</h4>
                                    <p className="text-sm text-dark-200 font-medium">{job.job_title || job.title}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs text-dark-500 uppercase tracking-wider mb-1 font-semibold">Description</h4>
                                    <p className="text-xs text-dark-300 leading-relaxed whitespace-pre-wrap">{job.job_description || job.description}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs text-dark-500 uppercase tracking-wider mb-2 font-semibold">Required Skills</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {jobSkills.map(skill => {
                                            const isMatched = matchedSkills.map(m => m.toLowerCase()).includes(skill.toLowerCase());
                                            return (
                                                <span
                                                    key={skill}
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${isMatched
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}
                                                >
                                                    {isMatched ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {skill}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

// =============================================================================
// Sub-Components
// =============================================================================

/** Circular score ring */
const ScoreRing = ({ percentage, size = 140 }) => {
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const color = percentage >= 70 ? '#10B981' : percentage >= 40 ? '#F59E0B' : '#EF4444';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background ring */}
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth}
                />
                {/* Score ring */}
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black font-mono ${getScoreColor(percentage)}`}>
                    {percentage.toFixed(0)}
                </span>
                <span className="text-xs text-dark-500">/ 100</span>
            </div>
        </div>
    );
};

/** Individual score weight bar */
const ScoreWeightBar = ({ label, weight, rawScore, contribution, icon: Icon, color, lightColor, description }) => {
    const rawPct = rawScore != null ? (rawScore * 100) : 0;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Icon className={`w-5 h-5 ${lightColor}`} />
                    <span className="text-base font-bold text-dark-50">{label}</span>
                    <span className="text-xs text-dark-400 px-2 py-0.5 bg-white/[0.06] rounded-md font-mono font-bold tracking-tight">{weight}%</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-mono">
                    <span className="text-dark-300 font-bold">{rawPct.toFixed(0)}%</span>
                    <span className="text-dark-500 font-black">→</span>
                    <span className={`text-base font-black ${getScoreColor(contribution)}`}>{contribution != null ? contribution.toFixed(1) : '—'}%</span>
                </div>
            </div>
            <div className="w-full h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${rawPct}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
            </div>
            <p className="text-sm font-semibold text-dark-300 leading-snug tracking-tight">{description}</p>
        </div>
    );
};

/** Tab button */
const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${active
            ? 'bg-primary-500/10 text-primary-400 ring-1 ring-primary-500/20'
            : 'text-dark-400 hover:text-dark-200 hover:bg-white/[0.03]'
            }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

// =============================================================================
// Helpers
// =============================================================================

function getRankExplanation(rank, overallPct, semantic, context, keyword, matchedCount, totalSkills) {
    const parts = [];

    if (rank === 1) {
        parts.push(`This candidate achieved the highest overall score of ${overallPct.toFixed(1)}%, earning the top rank.`);
    } else if (rank <= 3) {
        parts.push(`This candidate ranks #${rank} with an overall score of ${overallPct.toFixed(1)}%.`);
    } else {
        parts.push(`This candidate ranks #${rank} with an overall score of ${overallPct.toFixed(1)}%.`);
    }

    // Semantic analysis
    if (semantic != null) {
        const semPct = (semantic * 100).toFixed(0);
        if (semantic >= 0.7) {
            parts.push(`Their skills profile shows strong semantic alignment (${semPct}%) with the job requirements, contributing ${(semantic * 60).toFixed(1)}% to the total score.`);
        } else if (semantic >= 0.4) {
            parts.push(`Their skills have moderate semantic alignment (${semPct}%) with the job requirements, contributing ${(semantic * 60).toFixed(1)}% to the total score.`);
        } else {
            parts.push(`Their skills show limited semantic alignment (${semPct}%) with the job requirements, contributing only ${(semantic * 60).toFixed(1)}% to the total score.`);
        }
    }

    // Keyword analysis
    if (totalSkills > 0) {
        const pct = ((matchedCount / totalSkills) * 100).toFixed(0);
        parts.push(`${matchedCount} out of ${totalSkills} required skills (${pct}%) were found directly in their resume.`);
    }

    // Context
    if (context != null) {
        const ctxPct = (context * 100).toFixed(0);
        if (context >= 0.7) {
            parts.push(`The overall resume context strongly matches the job description (${ctxPct}%).`);
        } else if (context >= 0.4) {
            parts.push(`The resume context has a moderate match with the job description (${ctxPct}%).`);
        } else {
            parts.push(`The resume context has limited relevance to the job description (${ctxPct}%).`);
        }
    }

    return parts.join(' ');
}

export default ResumeBreakdown;
