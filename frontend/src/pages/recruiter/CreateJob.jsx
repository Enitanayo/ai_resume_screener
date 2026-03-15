import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { showToast } from '../../components/common/Toast';
import { Briefcase, ArrowLeft, Save } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobForm from '../../components/jobs/JobForm';
import { createJob } from '../../services/api';

const CreateJob = () => {
    const navigate = useNavigate();

    const handleCreate = async (data) => {
        const newJob = await createJob(data);
        showToast.success('Job created successfully!');
        navigate(`/recruiter/jobs/${newJob.$id || newJob.id}/candidates`);
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto space-y-6"
            >
                <div className="flex items-center gap-4">
                    <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} />
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-dark-50">Create Job</h1>
                        <p className="text-dark-400 text-sm mt-1">Post a new job opening for candidates</p>
                    </div>
                </div>

                <JobForm onSubmit={handleCreate} submitLabel="Create Job" />
            </motion.div>
        </DashboardLayout>
    );
};


export default CreateJob;
