import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, CheckCircle, AlertCircle, X, Trophy, Medal, Award,
    Eye, Download, RefreshCw, Users, ChevronRight, Loader2
} from 'lucide-react';
import {
    getAllJobs, batchUpload, analyseResumes, matchCandidates,
    getCandidatesByJob, getBatchStatus
} from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Dropdown from '../../components/common/Dropdown';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import CandidateDetails from '../../components/candidates/CandidateDetails';
import { showToast } from '../../components/common/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MAX_FILES = 50;

const medalConfig = {
    0: { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-300 dark:border-amber-600', label: '1st' },
    1: { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/40', border: 'border-gray-300 dark:border-gray-600', label: '2nd' },
    2: { icon: Award, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-600', label: '3rd' },
};

const getScoreColor = (percentage) => {
    if (percentage >= 70) return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
    if (percentage >= 40) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
    return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
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

    // Results
    const [rankedResults, setRankedResults] = useState([]);
    const [currentBatchIds, setCurrentBatchIds] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

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

        const fetchCandidates = async () => {
            setIsLoadingCandidates(true);
            try {
                const data = await getCandidatesByJob(selectedJobId);
                setExistingCandidates(data || []);
            } catch (err) {
                console.error('Failed to load existing candidates:', err);
                setExistingCandidates([]);
            } finally {
                setIsLoadingCandidates(false);
            }
        };
        fetchCandidates();
    }, [selectedJobId, jobs]);

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
        if (files.length === 0) {
            showToast.error('Please select files to upload');
            return;
        }

        try {
            // Step 1: Upload files
            setStage(STAGES.UPLOADING);
            const uploadResult = await batchUpload(selectedJobId, files);
            const uploadedCount = uploadResult.count || files.length;
            const newCandidateIds = uploadResult.candidate_ids || [];

            setCurrentBatchIds(newCandidateIds);
            showToast.success(`Uploaded ${uploadedCount} resume(s)`);
            setFiles([]);

            // Step 2: Wait for backend to process
            setStage(STAGES.ANALYSING);
            setProgress({ total: uploadedCount, processed: 0 });
            await pollForResults(newCandidateIds, uploadedCount);

            // Step 3: Get ranked results
            setStage(STAGES.MATCHING);
            await runMatch(newCandidateIds);

        } catch (err) {
            showToast.error(err.message || 'Pipeline failed');
            setStage(STAGES.IDLE);
        }
    };

    // Poll for the specific candidate IDs to reach 'ready' status
    const pollForResults = (newCandidateIds, uploadedCount) => {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const MAX_POLL_TIME = 300000; // 5 minutes
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

            pollingRef.current = setInterval(poll, 4000);
            setTimeout(poll, 2000); //snappier first check
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

    // --- View candidate ---
    const handleViewCandidate = (candidateId) => {
        const found = existingCandidates.find(c => (c.$id || c.id) === candidateId);
        if (found) setSelectedCandidate(found);
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
    const jobOptions = jobs.map(j => ({ value: j.$id || j.id, label: j.job_title || j.title }));
    const pendingCount = existingCandidates.filter(c =>
        c.processing_status === 'pending' || c.processing_status === 'processing' || c.processing_status === 'failed'
    ).length;
    const processedCount = existingCandidates.filter(c => c.processing_status === 'ready').length;
    const isProcessing = stage !== STAGES.IDLE && stage !== STAGES.DONE;

    if (isLoadingJobs) return <DashboardLayout><Loading text="Loading jobs..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Upload & Ranking</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Upload resumes, run AI analysis, and see ranked results — all in one place
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Job Selection + Upload + Existing */}
                    <div className="lg:col-span-1 space-y-5">
                        {/* Job Selector */}
                        <Card className="p-5">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">1. Select Job</h3>
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
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Existing Applicants
                                </h3>
                                {isLoadingCandidates ? (
                                    <p className="text-sm text-gray-500">Loading...</p>
                                ) : existingCandidates.length === 0 ? (
                                    <p className="text-sm text-gray-500">No applicants yet for this job</p>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Total</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{existingCandidates.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-green-600 dark:text-green-400">Analysed</span>
                                            <span className="font-medium">{processedCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                                            <span className="font-medium">{pendingCount}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Previous uploads are stored securely but are excluded from the current ranking display.
                                        </p>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* File Upload */}
                        <Card className="p-5">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">2. Upload New Resumes</h3>
                            <div
                                className="p-6 border-2 border-dashed border-gray-300 dark:border-dark-600 hover:border-primary-400 dark:hover:border-primary-500 rounded-xl transition-colors cursor-pointer text-center"
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                            >
                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop files or click to browse</p>
                                <p className="text-xs text-gray-500 mt-1">PDF / DOCX • Max {MAX_FILES}</p>
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
                                                className="flex items-center justify-between py-1.5 px-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                                                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                                                </div>
                                                <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </motion.div>
                                        ))}
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-xs text-gray-500">{files.length} file(s)</span>
                                            <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:text-red-600">Clear all</button>
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
                            disabled={!selectedJobId || isProcessing}
                        >
                            {stage === STAGES.UPLOADING ? 'Uploading...'
                                : stage === STAGES.ANALYSING ? 'Analysing...'
                                    : stage === STAGES.MATCHING ? 'Ranking...'
                                        : files.length > 0
                                            ? `Upload & Rank ${files.length} Resume(s)`
                                            : pendingCount > 0
                                                ? `Analyse & Rank ${pendingCount} Resume(s)`
                                                : 'Upload & Rank Resumes'}
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
                    <div className="lg:col-span-2">
                        {rankedResults.length > 0 ? (
                            <div className="space-y-4">
                                {/* Header with download buttons */}
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                                            <Trophy className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rankings</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {rankedResults.length} candidate(s) ranked by AI match score
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" size="sm" icon={Download} onClick={downloadPDF}>
                                            PDF
                                        </Button>
                                        <Button variant="secondary" size="sm" icon={Download} onClick={downloadWord}>
                                            Word
                                        </Button>
                                    </div>
                                </div>

                                {/* Leaderboard */}
                                <div className="space-y-2.5">
                                    {rankedResults.map((result, index) => {
                                        const medal = medalConfig[index];
                                        const percentage = result.match_percentage || 0;
                                        const scoreColors = getScoreColor(percentage);

                                        return (
                                            <motion.div
                                                key={result.candidate_id}
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05, type: 'spring', stiffness: 120 }}
                                            >
                                                <Card className={`p-4 transition-all duration-300 ${medal ? `border-2 ${medal.border}` : ''}`}>
                                                    <div className="flex items-center gap-4">
                                                        {/* Rank */}
                                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${medal ? medal.bg : 'bg-gray-100 dark:bg-dark-700'}`}>
                                                            {medal ? (
                                                                <medal.icon className={`w-5 h-5 ${medal.color}`} />
                                                            ) : (
                                                                <span className="text-base font-bold text-gray-500 dark:text-gray-400">{index + 1}</span>
                                                            )}
                                                        </div>

                                                        {/* Name + Progress */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                                    {result.candidate_name || `Candidate ${result.candidate_id?.slice(0, 8)}`}
                                                                </h4>
                                                                {medal && <span className={`text-xs font-bold ${medal.color}`}>{medal.label}</span>}
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2 overflow-hidden">
                                                                <motion.div
                                                                    className={`h-full rounded-full ${scoreColors.bar}`}
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${percentage}%` }}
                                                                    transition={{ delay: index * 0.05 + 0.3, duration: 0.8, ease: 'easeOut' }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Score */}
                                                        <span className={`text-lg font-bold ${scoreColors.text} flex-shrink-0`}>
                                                            {percentage.toFixed(1)}%
                                                        </span>

                                                        {/* View Button */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            icon={Eye}
                                                            onClick={() => handleViewCandidate(result.candidate_id)}
                                                        >
                                                            View
                                                        </Button>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <Card className="p-12 text-center h-full flex flex-col items-center justify-center">
                                <Trophy className="w-14 h-14 text-gray-300 dark:text-dark-600 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                    No Rankings Yet
                                </h3>
                                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm">
                                    Select a job, upload resumes, and click the button to upload, analyse, and rank all candidates automatically.
                                </p>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Candidate Detail Modal */}
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
            </motion.div>
        </DashboardLayout>
    );
};

// Step indicator component for the processing pipeline
const Step = ({ label, active, done, sub }) => (
    <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-green-500' : active ? 'bg-primary-500 animate-pulse' : 'bg-gray-200 dark:bg-dark-700'
            }`}>
            {done ? (
                <CheckCircle className="w-4 h-4 text-white" />
            ) : active ? (
                <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
                <span className="w-2 h-2 rounded-full bg-gray-400" />
            )}
        </div>
        <div>
            <p className={`text-sm font-medium ${done ? 'text-green-600 dark:text-green-400' : active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                {label}
            </p>
            {sub && <p className="text-xs text-gray-500">{sub}</p>}
        </div>
    </div>
);

export default BatchUpload;
