import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobForm from '../../components/jobs/JobForm';
import Button from '../../components/common/Button';
import { createJob } from '../../services/api';
import { showToast } from '../../components/common/Toast';

const CreateJob = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        try {
            await createJob(formData);
            showToast.success('Job created successfully!');
            navigate('/recruiter/jobs');
        } catch (err) {
            console.error('Failed to create job:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} className="mb-6">
                Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Job</h1>
            <JobForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create Job" />
        </DashboardLayout>
    );
};

export default CreateJob;
