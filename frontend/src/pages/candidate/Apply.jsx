import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import { showToast } from '../../components/common/Toast';
import { getJobById, applyToJob } from '../../services/api';
import useAuthStore from '../../store/authStore';

const Apply = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();
    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const data = await getJobById(jobId);
                setJob(data);
            } catch (err) {
                showToast.error('Failed to load job details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            showToast.error('Please upload your resume');
            return;
        }

        setIsSubmitting(true);
        try {
            await applyToJob(jobId, {
                firstName,
                lastName,
                email,
                resume: file,
                jobTitle: job?.job_title || job?.title || 'Job Application'
            });
            showToast.success('Application submitted successfully!');
            navigate('/candidate/applications');
        } catch (err) {
            showToast.error(err.message || 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Loading text="Loading application..." />;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto px-4 py-8"
        >
            <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} className="mb-6">
                Back to Jobs
            </Button>

            <Card className="p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-heading font-bold text-dark-50">Apply for Position</h1>
                    <p className="text-dark-400 mt-1">{job?.job_title || job?.title}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            placeholder="e.g. John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                        <Input
                            label="Last Name"
                            placeholder="e.g. Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-dark-300 font-heading">Resume (PDF or DOCX)</label>
                        <div
                            className={`p-10 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
                                file ? 'border-primary-500/50 bg-primary-500/5' : 'border-white/[0.08] hover:border-primary-500/30 bg-white/[0.02]'
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                id="resume-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.docx"
                                onChange={handleFileChange}
                            />
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <div className="p-3 rounded-xl bg-primary-500/20 text-primary-400 mb-3">
                                        <FileText size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-dark-100 truncate max-w-xs">{file.name}</p>
                                    <p className="text-xs text-dark-500 mt-1">{(file.size / 1024).toFixed(1)} KB • Click to change</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="p-3 rounded-xl bg-dark-800 text-dark-400 mb-3">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-dark-200">Click to upload or drag and drop</p>
                                    <p className="text-xs text-dark-500 mt-1">PDF or DOCX (max 10MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            fullWidth
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={isSubmitting}
                            icon={CheckCircle}
                        >
                            Submit Application
                        </Button>
                    </div>
                </form>
            </Card>
        </motion.div>
    );
};

export default Apply;
