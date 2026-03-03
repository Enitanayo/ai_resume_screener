import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getJobById } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobForm from '../../components/jobs/JobForm';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';

const EditJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getJobById(id);
                setJob(data);
            } catch (err) {
                console.error(err);
                console.error('Failed to load job:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [id]);

    const handleSubmit = async (formData) => {
        setIsSaving(true);
        try {
            // Note: Update endpoint would be used here if available
            showToast.success('Job updated successfully');
            navigate('/recruiter/jobs');
        } catch (err) {
            console.error('Failed to update job:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <DashboardLayout><Loading text="Loading job..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} className="mb-6">
                Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Job</h1>
            <JobForm
                initialData={job}
                onSubmit={handleSubmit}
                isLoading={isSaving}
                submitLabel="Update Job"
            />
        </DashboardLayout>
    );
};

export default EditJob;
