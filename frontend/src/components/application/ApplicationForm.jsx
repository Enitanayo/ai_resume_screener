import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import ResumeUpload from './ResumeUpload';
import { applyToJob } from '../../services/api';
import fileService from '../../services/fileService';
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
            // Backend expects: first_name, last_name, email, resume (file)
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
            <Card className="p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Apply for {job?.job_title || job?.title}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            name="first_name"
                            placeholder="John"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Last Name"
                            name="last_name"
                            placeholder="Doe"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <ResumeUpload
                        onFileSelect={setFile}
                        selectedFile={file}
                        error={error && !file ? error : null}
                    />

                    {error && file && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        icon={Send}
                        isLoading={isSubmitting}
                        disabled={!file || !formData.first_name || !formData.last_name || !formData.email}
                    >
                        Submit Application
                    </Button>
                </form>
            </Card>
        </motion.div>
    );
};

export default ApplicationForm;
