import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import ResumeUpload from './ResumeUpload';
import { applyToJob } from '../../services/api';
import { showToast } from '../../components/common/Toast';

const ApplicationForm = ({ job, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please upload your resume');
            return;
        }
        if (!formData.first_name || !formData.last_name || !formData.email) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const fd = new FormData();
            fd.append('first_name', formData.first_name);
            fd.append('last_name', formData.last_name);
            fd.append('email', formData.email);
            fd.append('resume', file);

            const jobId = job.id || job.$id;
            const result = await applyToJob(jobId, fd);
            showToast.success('Application submitted successfully!');
            onSuccess?.(result);
        } catch (err) {
            const message = err.message || 'Failed to submit application';
            setError(message);
            showToast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="p-8 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="mb-8">
                        <h2 className="text-2xl font-heading font-bold text-dark-50">
                            Apply for <span className="text-gradient">{job?.job_title || job?.title}</span>
                        </h2>
                        <p className="text-dark-400 mt-2">
                            Fill in your details and upload your resume to start the AI screening process.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Input
                                label="First Name"
                                name="first_name"
                                placeholder="e.g. John"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Last Name"
                                name="last_name"
                                placeholder="e.g. Doe"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            placeholder="e.g. john.doe@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <div className="pt-2">
                            <ResumeUpload
                                onFileSelect={setFile}
                                selectedFile={file}
                                error={error && !file ? error : null}
                            />
                        </div>

                        {error && file && (
                            <motion.p
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-sm font-medium text-red-400 bg-red-500/5 p-3 rounded-xl border border-red-500/10"
                            >
                                {error}
                            </motion.p>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="xl"
                            fullWidth
                            icon={Send}
                            isLoading={isSubmitting}
                            disabled={!file || !formData.first_name || !formData.last_name || !formData.email}
                            className="h-14 text-base"
                        >
                            Submit Application
                        </Button>

                        <p className="text-[11px] text-center text-dark-500 font-medium px-4">
                            By clicking submit, you agree to share your information and resume with the hiring team for evaluation using our AI-powered screening process.
                        </p>
                    </form>
                </div>
            </Card>
        </motion.div>
    );
};

export default ApplicationForm;
