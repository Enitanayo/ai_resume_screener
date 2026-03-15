import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import { showToast } from '../../components/common/Toast';
import { getJobById, applyToJob } from '../../services/api';

const Apply = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const data = await getJobById(jobId);
                setJob(data);
            } catch (err) {
                showToast.error('Failed to load job');
            } finally {
                setIsLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && (selected.type === 'application/pdf' || selected.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            setFile(selected);
        } else {
            showToast.error('Please upload a PDF or DOCX file');
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            showToast.error('Please upload your resume');
            return;
        }

        setIsSubmitting(true);
        try {
            await applyToJob(jobId, file);
            showToast.success('Application submitted successfully!');
            navigate('/candidate/applications');
        } catch (err) {
            showToast.error(err.message || 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Loading text="Loading job..." />;

    const skills = job?.required_skills || [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
            <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} className="mb-6">
                Back
            </Button>

            {/* Job Info */}
            <Card className="p-8 mb-6">
                <h1 className="text-2xl font-heading font-bold text-dark-50 mb-2">
                    {job?.job_title || job?.title}
                </h1>
                <p className="text-dark-300 leading-relaxed mb-4 whitespace-pre-line">
                    {job?.job_description || job?.description}
                </p>
                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                            <Badge key={skill} variant="primary" size="sm">{skill}</Badge>
                        ))}
                    </div>
                )}
            </Card>

            {/* Upload Resume */}
            <Card className="p-8">
                <h2 className="text-lg font-semibold text-dark-50 mb-4">Upload Your Resume</h2>

                <div
                    className="p-8 border-2 border-dashed border-white/[0.08] hover:border-primary-500/40 rounded-2xl transition-all cursor-pointer text-center"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {file ? (
                        <div className="flex items-center justify-center gap-3">
                            <CheckCircle className="w-6 h-6 text-emerald-400" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-dark-50">{file.name}</p>
                                <p className="text-xs text-dark-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-10 h-10 mx-auto text-dark-400 mb-3" />
                            <p className="text-sm font-medium text-dark-200">Drop your resume or click to browse</p>
                            <p className="text-xs text-dark-500 mt-1">PDF or DOCX format</p>
                        </>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <Button
                    fullWidth
                    size="lg"
                    className="mt-6"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    disabled={!file}
                >
                    Submit Application
                </Button>
            </Card>
        </motion.div>
    );
};

export default Apply;
