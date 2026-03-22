import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, CheckCircle, AlertCircle, X, Trophy, Medal, Award,
    Eye, Download, RefreshCw, Users, ChevronRight, Loader2
} from 'lucide-react';
import {
    getAllJobs, batchUpload, analyseResumes, matchCandidates,
    getCandidatesByJob, getBatchStatus, triggerBatchProcessing
} from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Dropdown from '../../components/common/Dropdown';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import Toggle from '../../components/common/Toggle';
import CandidateDetails from '../../components/candidates/CandidateDetails';
import ResumeBreakdown from '../../components/candidates/ResumeBreakdown';
import { showToast } from '../../components/common/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MAX_FILES = 50;

const medalConfig = {
    0: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: '1st' },
    1: { icon: Medal, color: 'text-dark-300', bg: 'bg-white/[0.04]', border: 'border-white/[0.06]', label: '2nd' },
    2: { icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: '3rd' },
};

const getScoreColor = (percentage) => {
    if (percentage >= 70) return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
    if (percentage >= 40) return { bar: 'bg-amber-500', text: 'text-amber-400' };
    return { bar: 'bg-red-500', text: 'text-red-400' };
};

// Processing pipeline stages
const STAGES = {
    IDLE: 'idle',
    UPLOADING: 'uploading',
    ANALYSING: 'analysing',
    MATCHING: 'matching',
    DONE: 'done',
};

const BatchUpload = () => {
    // Job & file state
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [files, setFiles] = useState([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);

    // Existing candidates for selected job
    const [existingCandidates, setExistingCandidates] = useState([]);
    const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

    // Processing pipeline
    const [stage, setStage] = useState(STAGES.IDLE);
    const [progress, setProgress] = useState({ total: 0, processed: 0 });
    const pollingRef = useRef(null);
    const listPollingRef = useRef(null);

    // Results
    const [rankedResults, setRankedResults] = useState([]);
    const [currentBatchIds, setCurrentBatchIds] = useState([]);
    const [includeApplied, setIncludeApplied] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [breakdownCandidate, setBreakdownCandidate] = useState(null);
    const [breakdownRank, setBreakdownRank] = useState(null);

    const fileInputRef = useRef(null);

    // Load jobs on mount
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getAllJobs();
                setJobs(data);
            } catch (err) {
                showToast.error('Failed to load jobs');
            } finally {
                setIsLoadingJobs(false);
            }
        };
        fetchJobs();
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, []);

    // When a job is selected, fetch its existing candidates
    useEffect(() => {
        if (!selectedJobId) {
            setExistingCandidates([]);
            setSelectedJob(null);
            setRankedResults([]);
            setCurrentBatchIds([]);
            return;
        }
        const job = jobs.find(j => (j.$id || j.id) === selectedJobId);
        setSelectedJob(job);
        
        if (listPollingRef.current) clearInterval(listPollingRef.current);

        const fetchCandidates = async (showLoading = true) => {
            if (showLoading) setIsLoadingCandidates(true);
            try {
                const data = await getCandidatesByJob(selectedJobId);
                setExistingCandidates(data || []);
            } catch (err) {
                console.error('Failed to load existing candidates:', err);
            } finally {
                if (showLoading) setIsLoadingCandidates(false);
            }
        };

        fetchCandidates();
        
        // Poll for new applications every 15 seconds
        listPollingRef.current = setInterval(() => {
            if (stage === STAGES.IDLE) fetchCandidates(false);
        }, 15000);

        return () => { if (listPollingRef.current) clearInterval(listPollingRef.current); };
    }, [selectedJobId, jobs, stage]);

    // --- File handling ---
    const handleFileSelect = (e) => addFiles(Array.from(e.target.files));
    const handleDrop = (e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); };

    const addFiles = (incoming) => {
        const valid = incoming.filter(
            f => f.type === 'application/pdf' ||
                f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        if (valid.length < incoming.length) showToast.error('Only PDF and DOCX files are allowed');
        setFiles(prev => {
            const combined = [...prev, ...valid];
            if (combined.length > MAX_FILES) {
                showToast.error(`Maximum ${MAX_FILES} files per batch`);
                return combined.slice(0, MAX_FILES);
            }
            return combined;
        });
    };

    const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

    // --- Full pipeline: Upload → Wait for processing → Show results ---
    const runFullPipeline = async () => {
        if (!selectedJobId) { showToast.error('Please select a job'); return; }
        if (files.length === 0 && !includeApplied) {
            showToast.error('Please select files to upload or enable "Include Applied Candidates"');
            return;
        }

        // Reset state for new run
        setRankedResults([]);
        const allTargetCandidateIds = [];
        let totalToProcess = 0;

        try {
            setStage(STAGES.UPLOADING);

            // Step 1a: Upload new files if any
            if (files.length > 0) {
                const uploadResult = await batchUpload(selectedJobId, files);
                const newIds = uploadResult.candidate_ids || [];
                allTargetCandidateIds.push(...newIds);
                totalToProcess += newIds.length;
                showToast.success(`Uploaded ${newIds.length} new resume(s)`);
                setFiles([]);
            }
            // Step 1b: Include ONLY true form applicants if toggled
            if (includeApplied) {
                try {
                    // Filter for candidates who applied via form (not @batch.upload placeholders)
                    const trueApplicants = existingCandidates.filter(c => 
                        c.email && !c.email.endsWith('@batch.upload')
                    );
                    
                    const existingIds = trueApplicants.map(c => c.id);
                    existingIds.forEach(id => {
                        if (!allTargetCandidateIds.includes(id)) {
                            allTargetCandidateIds.push(id);
                        }
                    });

                    // Trigger backend processing for any pending ones
                    await triggerBatchProcessing(selectedJobId);
                    
                    totalToProcess = allTargetCandidateIds.length;
                } catch (err) {
                    console.error('Trigger batch failed:', err);
                    if (files.length === 0) throw err;
                }
            } else {
                totalToProcess = allTargetCandidateIds.length;
            }

            if (allTargetCandidateIds.length === 0) {
                showToast.error('No candidates to process');
                setStage(STAGES.IDLE);
                return;
            }

            setCurrentBatchIds(allTargetCandidateIds);
            // Step 2: Wait for backend to process
            setStage(STAGES.ANALYSING);
            setProgress({ total: totalToProcess, processed: 0 });

            // We start at 0 even if some are ready, then the first poll will update it
            await pollForResults(allTargetCandidateIds, totalToProcess);

            // Step 3: Get ranked results
            setStage(STAGES.MATCHING);
            await runMatch(allTargetCandidateIds);

        } catch (err) {
            showToast.error(err.message || 'Pipeline failed');
            setStage(STAGES.IDLE);
        }
    };

    // Poll for the specific candidate IDs to reach 'ready' status
    const pollForResults = (newCandidateIds, uploadedCount) => {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const MAX_POLL_TIME = 900000; // 15 minutes
            const expectedIds = new Set(newCandidateIds.map(String));

            const poll = async () => {
                try {
                    const candidates = await getCandidatesByJob(selectedJobId);
                    const readyIds = (candidates || [])
                        .filter(c => c.processing_status === 'ready')
                        .map(c => String(c.id));

                    const newlyReadyIds = readyIds.filter(id => expectedIds.has(id));
                    const newlyProcessedCount = newlyReadyIds.length;

                    console.log(`Polling: newlyProcessed=${newlyProcessedCount}/${uploadedCount}`);

                    setProgress({ total: uploadedCount, processed: newlyProcessedCount });

                    const elapsed = Date.now() - startTime;

                    if (newlyProcessedCount >= uploadedCount || elapsed > MAX_POLL_TIME) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                        if (newlyProcessedCount < uploadedCount && elapsed > MAX_POLL_TIME) {
                            showToast.error('Processing timed out — showing available results');
                        }
                        resolve();
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            };

            // Delay the first update significantly to ensure the user sees 0/X
            setTimeout(() => {
                if (pollingRef.current) clearInterval(pollingRef.current);
                pollingRef.current = setInterval(poll, 4000);
                poll();
            }, 3000); // 3 second delay to keep 0/X visible
        });
    };

    const runMatch = async (candidateIds) => {
        try {
            const results = await matchCandidates(selectedJobId, candidateIds);
            setRankedResults(results);
            setStage(STAGES.DONE);
            showToast.success(`Ranked ${results.length} candidate(s)!`);

            // Refresh existing candidates
            const updated = await getCandidatesByJob(selectedJobId);
            setExistingCandidates(updated || []);
        } catch (err) {
            showToast.error(err.message || 'Matching failed');
            setStage(STAGES.DONE);
        }
    };

    // --- View candidate (existing applicants section) ---
    const handleViewCandidate = (candidateId) => {
        const found = existingCandidates.find(c => (c.$id || c.id) === candidateId);
        if (found) setSelectedCandidate(found);
    };

    // --- View ranked candidate breakdown ---
    const handleViewBreakdown = (result, index) => {
        setBreakdownCandidate(result);
        setBreakdownRank(index + 1);
    };

    // --- Download rankings ---
    const downloadPDF = () => {
        if (rankedResults.length === 0) return;
        const doc = new jsPDF();
        const jobTitle = selectedJob?.job_title || selectedJob?.title || 'Job';

        doc.setFontSize(18);
        doc.text(`Candidate Rankings — ${jobTitle}`, 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 28);

        const tableData = rankedResults.map((r, i) => [
            `#${i + 1}`,
            r.candidate_name || `Candidate ${r.candidate_id?.slice(0, 8)}`,
            `${r.match_percentage?.toFixed(1)}%`,
            r.score_breakdown?.semantic_similarity != null
                ? `${(r.score_breakdown.semantic_similarity * 100).toFixed(0)}%` : '—',
            r.score_breakdown?.keyword_match != null
                ? `${(r.score_breakdown.keyword_match * 100).toFixed(0)}%` : '—',
        ]);

        autoTable(doc, {
            startY: 34,
            head: [['Rank', 'Candidate', 'Overall Score', 'Semantic Match', 'Keyword Match']],
            body: tableData,
            headStyles: { fillColor: [79, 70, 229] },
            alternateRowStyles: { fillColor: [245, 245, 255] },
            styles: { fontSize: 10 },
        });

        doc.save(`rankings_${jobTitle.replace(/\s+/g, '_')}.pdf`);
    };

    const downloadWord = () => {
        if (rankedResults.length === 0) return;
        const jobTitle = selectedJob?.job_title || selectedJob?.title || 'Job';
        let html = `<html><head><meta charset="utf-8"><title>Rankings - ${jobTitle}</title></head><body>`;
        html += `<h1>Candidate Rankings — ${jobTitle}</h1>`;
        html += `<p>Generated on ${new Date().toLocaleString()}</p>`;
        html += `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">`;
        html += `<tr style="background:#4f46e5;color:white"><th>Rank</th><th>Candidate</th><th>Overall Score</th><th>Semantic</th><th>Keyword</th></tr>`;
        rankedResults.forEach((r, i) => {
            const bg = i % 2 === 0 ? '#f5f5ff' : '#ffffff';
            html += `<tr style="background:${bg}">`;
            html += `<td>#${i + 1}</td>`;
            html += `<td>${r.candidate_name || `Candidate ${r.candidate_id?.slice(0, 8)}`}</td>`;
            html += `<td>${r.match_percentage?.toFixed(1)}%</td>`;
            html += `<td>${r.score_breakdown?.semantic_similarity != null ? (r.score_breakdown.semantic_similarity * 100).toFixed(0) + '%' : '—'}</td>`;
            html += `<td>${r.score_breakdown?.keyword_match != null ? (r.score_breakdown.keyword_match * 100).toFixed(0) + '%' : '—'}</td>`;
            html += `</tr>`;
        });
        html += `</table></body></html>`;

        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rankings_${jobTitle.replace(/\s+/g, '_')}.doc`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- Derived data ---
    const jobOptions = useMemo(() => 
        jobs.map(j => ({ value: j.$id || j.id, label: j.job_title || j.title })),
    [jobs]);

    const appliedCandidates = useMemo(() => 
        existingCandidates.filter(c => c.email && !c.email.endsWith('@batch.upload')),
    [existingCandidates]);

    const appliedCount = appliedCandidates.length;

    const processedCount = useMemo(() => 
        existingCandidates.filter(c => c.processing_status === 'ready').length,
    [existingCandidates]);

    const pendingCount = useMemo(() => 
        existingCandidates.filter(c => 
            c.processing_status === 'pending' || c.processing_status === 'processing'
        ).length,
    [existingCandidates]);

    const isProcessing = useMemo(() => 
        stage !== STAGES.IDLE && stage !== STAGES.DONE,
    [stage]);

    if (isLoadingJobs) return <DashboardLayout><Loading text="Loading jobs..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-8">
                    <h1 className="text-2xl font-heading font-bold text-dark-50">Resume Upload & Ranking</h1>
                    <p className="text-dark-400 mt-1">
                        Upload resumes, run AI analysis, and see ranked results — all in one place
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Job Selection + Upload + Existing */}
                    <div className="lg:col-span-1 space-y-5">
                        {/* Job Selector */}
                        <Card className="p-5">
                            <h3 className="text-sm font-semibold text-dark-50 mb-3">1. Select Job</h3>
                            <Dropdown
                                value={selectedJobId}
                                options={jobOptions}
                                onSelect={setSelectedJobId}
                                placeholder="Choose a job posting..."
                                className="w-full"
                            />
                        </Card>

                        {/* Existing candidates summary */}
                        {selectedJobId && (
                            <Card className="p-5">
                                <h3 className="text-sm font-semibold text-dark-50 mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Existing Applicants
                                </h3>
                                {isLoadingCandidates ? (
                                    <p className="text-sm text-dark-400">Loading...</p>
                                ) : existingCandidates.length === 0 ? (
                                    <p className="text-sm text-dark-400">No applicants yet for this job</p>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm py-1 border-b border-white/5">
                                            <span className="text-dark-300 font-medium">Applied (via Form)</span>
                                            <span className="font-bold text-primary-400 font-mono">{appliedCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-emerald-400">Total Analysed Resumes</span>
                                            <span className="font-medium font-mono">
                                                {existingCandidates.filter(c => c.processing_status === 'ready').length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-amber-400">Pending</span>
                                            <span className="font-medium font-mono">
                                                {existingCandidates.filter(c => c.processing_status === 'pending').length}
                                            </span>
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-white/10">
                                            <p className="text-[12px] text-dark-300 leading-tight">
                                                All {existingCandidates.length} documents are stored securely for this job.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Toggle for existing candidates */}
                        {selectedJobId && (
                            <Card className="p-1">
                                <Toggle
                                    enabled={includeApplied}
                                    onChange={setIncludeApplied}
                                    label="Include Applied Candidates"
                                    description="Analyze resumes from candidates who applied to this job"
                                    icon={Users}
                                />
                            </Card>
                        )}

                        {/* File Upload */}
                        <Card className="p-5">
                            <h3 className="text-sm font-semibold text-dark-50 mb-3">2. Upload New Resumes</h3>
                            <div
                                className="p-6 border-2 border-dashed border-white/[0.08] hover:border-primary-500/40 rounded-xl transition-colors cursor-pointer text-center"
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                            >
                                <Upload className="w-8 h-8 mx-auto text-dark-400 mb-2" />
                                <p className="text-sm font-medium text-dark-200">Drop files or click to browse</p>
                                <p className="text-xs text-dark-500 mt-1">PDF / DOCX • Max {MAX_FILES}</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.docx"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {/* File list */}
                            <AnimatePresence>
                                {files.length > 0 && (
                                    <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
                                        {files.map((file, i) => (
                                            <motion.div
                                                key={`${file.name}-${i}`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="flex items-center justify-between py-1.5 px-3 bg-white/[0.03] rounded-lg"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                                                    <span className="text-xs text-dark-200 truncate">{file.name}</span>
                                                </div>
                                                <button onClick={() => removeFile(i)} className="text-dark-500 hover:text-red-400 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </motion.div>
                                        ))}
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-xs text-dark-500">{files.length} file(s)</span>
                                            <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-300">Clear all</button>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </Card>

                        {/* Action Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            icon={isProcessing ? Loader2 : Upload}
                            onClick={runFullPipeline}
                            isLoading={isProcessing}
                            disabled={!selectedJobId || isProcessing || (files.length === 0 && (!includeApplied || (pendingCount === 0 && processedCount === 0)))}
                        >
                            {stage === STAGES.UPLOADING ? 'Uploading...'
                                : stage === STAGES.ANALYSING ? 'Analysing...'
                                    : stage === STAGES.MATCHING ? 'Ranking...'
                                        : (() => {
                                            const totalBatchCount = files.length + (includeApplied ? appliedCount : 0);
                                            if (totalBatchCount === 0) return 'Upload & Rank Resumes';
                                            const label = files.length > 0 ? 'Upload & Rank' : 'Analyse & Rank';
                                            const unit = totalBatchCount === 1 ? (files.length > 0 ? 'Resume' : 'Applicant') : (files.length > 0 ? 'Resumes' : 'Applicants');
                                            return `${label} ${totalBatchCount} ${unit}`;
                                        })()}
                        </Button>

                        {/* Pipeline progress */}
                        {isProcessing && (
                            <Card className="p-4">
                                <div className="space-y-3">
                                    <Step label="Upload" active={stage === STAGES.UPLOADING} done={stage !== STAGES.UPLOADING && stage !== STAGES.IDLE} />
                                    <Step label="AI Analysis" active={stage === STAGES.ANALYSING} done={stage === STAGES.MATCHING || stage === STAGES.DONE}
                                        sub={stage === STAGES.ANALYSING ? `${progress.processed}/${progress.total} processed` : null} />
                                    <Step label="Ranking" active={stage === STAGES.MATCHING} done={stage === STAGES.DONE} />
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Rankings / Results */}
                    <div className="lg:col-span-2 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {rankedResults.length > 0 ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-4"
                                >
                                    {/* Header with download buttons */}
                                    <div className="flex items-center justify-between flex-wrap gap-3 p-1">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-2xl bg-gradient-to-tr from-primary-600 to-violet-600 shadow-xl shadow-primary-500/20">
                                                <Trophy className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                                    Match Rankings
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {rankedResults.length} candidate(s) analyzed by Gemini AI
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

                                    {/* Leaderboard */}
                                    <div className="space-y-3 mt-4">
                                        <AnimatePresence>
                                            {rankedResults.map((result, index) => {
                                                const medal = medalConfig[index];
                                                const percentage = result.match_percentage || 0;
                                                const scoreColors = getScoreColor(percentage);

                                                return (
                                                    <motion.div
                                                        key={`candidate-${result.candidate_id}`}
                                                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, x: 50 }}
                                                        transition={{
                                                            delay: index * 0.08,
                                                            type: 'spring',
                                                            stiffness: 100,
                                                            damping: 15
                                                        }}
                                                    >
                                                        <Card className={`p-5 transition-all duration-500 relative overflow-hidden group
                                                            ${medal ? 'bg-dark-800/80 backdrop-blur-xl border-white/[0.06] ' + medal.border : 'bg-dark-800 border-white/[0.06]'}
                                                            hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1`}>

                                                            {/* Background Glow for Top Candidates */}
                                                            {index === 0 && (
                                                                <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber-400/10 blur-[60px] rounded-full pointer-events-none" />
                                                            )}

                                                            <div className="flex items-center gap-5 relative z-10">
                                                                {/* Rank Badge */}
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                                                                    ${medal ? medal.bg : 'bg-white/[0.04]'}`}>
                                                                    {medal ? (
                                                                        <medal.icon className={`w-6 h-6 ${medal.color}`} />
                                                                    ) : (
                                                                        <span className="text-lg font-black text-dark-500">{index + 1}</span>
                                                                    )}
                                                                </div>

                                                                {/* Name + Progress */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className="text-md font-bold text-dark-50 truncate group-hover:text-primary-400 transition-colors">
                                                                                {result.candidate_name || `Candidate ${result.candidate_id?.slice(0, 8)}`}
                                                                            </h4>
                                                                            {medal && (
                                                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${medal.bg} ${medal.color} ring-1 ring-inset ${medal.border}`}>
                                                                                    {medal.label}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className={`text-xl font-black ${scoreColors.text}`}>
                                                                            {percentage.toFixed(0)}<span className="text-[10px] ml-0.5 opacity-70">%</span>
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-full bg-white/[0.04] rounded-full h-2.5 p-0.5 overflow-hidden ring-1 ring-inset ring-white/[0.04]">
                                                                        <motion.div
                                                                            className={`h-full rounded-full shadow-sm ${scoreColors.bar}`}
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${percentage}%` }}
                                                                            transition={{ delay: index * 0.1 + 0.4, duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* View Button */}
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
                                                            </div>
                                                        </Card>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ) : isProcessing ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center h-full py-12"
                                >
                                    <div className="relative mb-8">
                                        <div className="w-24 h-24 rounded-full border-4 border-primary-500/20 animate-ping absolute top-0 left-0" />
                                        <div className="w-24 h-24 rounded-full border-4 border-t-primary-500 border-r-primary-500/30 border-b-primary-500/10 border-l-primary-500/50 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-primary-500 animate-bounce" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-dark-50 mb-2 animate-pulse font-heading">
                                        {stage === STAGES.ANALYSING ? 'AI is scanning resumes...' : 'Calculating match scores...'}
                                    </h3>
                                    <p className="text-sm text-dark-400 text-center max-w-xs ring-1 ring-white/[0.06] px-4 py-2 rounded-full bg-dark-800 font-mono">
                                        {progress.processed}/{progress.total} candidates processed
                                    </p>

                                    {/* Skeleton Loader */}
                                    <div className="w-full mt-10 space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 shimmer rounded-2xl opacity-50" />
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-12 text-center h-full flex flex-col items-center justify-center border-2 border-dashed border-white/[0.06] rounded-3xl"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-dark-800 flex items-center justify-center mb-6">
                                        <Trophy className="w-10 h-10 text-dark-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-dark-50 mb-2 font-heading">
                                        Ready for Ranking
                                    </h3>
                                    <p className="text-sm text-dark-400 max-w-sm">
                                        Select a job and upload resumes to see your top-matching candidates with detailed AI scores.
                                    </p>
                                    <div className="mt-8 flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0s' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Candidate Detail Modal (for existing applicants) */}
                <Modal
                    isOpen={!!selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    title="Candidate Details"
                    size="xl"
                >
                    <CandidateDetails
                        candidate={selectedCandidate}
                        jobRequirements={selectedJob?.requirements}
                        onClose={() => setSelectedCandidate(null)}
                    />
                </Modal>

                {/* Resume Breakdown Modal (for ranked results VIEW button) */}
                <Modal
                    isOpen={!!breakdownCandidate}
                    onClose={() => { setBreakdownCandidate(null); setBreakdownRank(null); }}
                    title="Score Breakdown & Analysis"
                    size="full"
                >
                    <ResumeBreakdown
                        candidate={breakdownCandidate}
                        job={selectedJob}
                        rank={breakdownRank}
                        totalCandidates={rankedResults.length}
                        onClose={() => { setBreakdownCandidate(null); setBreakdownRank(null); }}
                    />
                </Modal>
            </motion.div>
        </DashboardLayout>
    );
};

// Step indicator component for the processing pipeline
const Step = ({ label, active, done, sub }) => (
    <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-emerald-500' : active ? 'bg-primary-500 animate-pulse' : 'bg-white/[0.04]'
            }`}>
            {done ? (
                <CheckCircle className="w-4 h-4 text-white" />
            ) : active ? (
                <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
                <span className="w-2 h-2 rounded-full bg-dark-500" />
            )}
        </div>
        <div>
            <p className={`text-sm font-medium ${done ? 'text-emerald-400' : active ? 'text-primary-400' : 'text-dark-500'}`}>
                {label}
            </p>
            {sub && <p className="text-xs text-dark-500 font-mono">{sub}</p>}
        </div>
    </div>
);

export default BatchUpload;
