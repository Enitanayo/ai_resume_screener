import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import JobList from '../../components/jobs/JobList';
import Modal from '../../components/common/Modal';
import Dropdown from '../../components/common/Dropdown';
import { showToast } from '../../components/common/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loading from '../../components/common/Loading';
import { getAllJobs, deleteJob } from '../../services/api';

const JobsManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, jobId: null });
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await getAllJobs();
            setJobs(data);
            setFilteredJobs(data);
        } catch (err) {
            showToast.error('Failed to load jobs');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let result = jobs;
        if (searchQuery) {
            result = result.filter((j) =>
                (j.job_title || j.title || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (statusFilter !== 'all') {
            result = result.filter((j) => j.processing_status === statusFilter);
        }
        setFilteredJobs(result);
    }, [searchQuery, statusFilter, jobs]);

    const handleDelete = async () => {
        try {
            await deleteJob(deleteModal.jobId);
            setJobs((prev) => prev.filter((j) => (j.$id || j.id) !== deleteModal.jobId));
            showToast.success('Job deleted');
            setDeleteModal({ isOpen: false, jobId: null });
        } catch {
            showToast.error('Failed to delete job');
        }
    };

    const filterOptions = [
        { value: 'all', label: 'All Jobs' },
        { value: 'ready', label: 'Ready' },
        { value: 'processing', label: 'Processing' },
    ];

    if (isLoading) return <DashboardLayout><Loading text="Loading jobs..." /></DashboardLayout>;

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-heading font-bold text-dark-50">Jobs</h1>
                    <Button icon={Plus} onClick={() => navigate('/recruiter/jobs/create')}>
                        New Job
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <Input
                            icon={Search}
                            placeholder="Search jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Dropdown
                        value={statusFilter}
                        onSelect={setStatusFilter}
                        options={filterOptions}
                        className="w-full sm:w-48"
                    />
                </div>

                <JobList
                    jobs={filteredJobs}
                    isLoading={isLoading}
                    isRecruiter
                    onDelete={(id) => setDeleteModal({ isOpen: true, jobId: id })}
                    emptyMessage="No jobs found"
                />

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, jobId: null })}
                    title="Delete Job"
                    size="sm"
                >
                    <div className="space-y-4">
                        <p className="text-dark-300">Are you sure you want to delete this job? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="ghost" onClick={() => setDeleteModal({ isOpen: false, jobId: null })}>
                                Cancel
                            </Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </Modal>
            </motion.div>
        </DashboardLayout>
    );
};


export default JobsManagement;
