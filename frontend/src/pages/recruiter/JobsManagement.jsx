import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllJobs, deleteJob as deleteJobApi } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobList from '../../components/jobs/JobList';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Dropdown from '../../components/common/Dropdown';
import Modal from '../../components/common/Modal';
import { showToast } from '../../components/common/Toast';

const JobsManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const data = await getAllJobs();
            setJobs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteJobApi(deleteId);
            setJobs((prev) => prev.filter((j) => (j.$id || j.id) !== deleteId));
            showToast.success('Job deleted successfully');
        } catch (err) {
            console.error('Failed to delete job:', err);
        }
        setDeleteId(null);
    };

    const filtered = jobs
        .filter((j) => {
            if (filter === 'active') return j.processing_status === 'ready';
            if (filter === 'inactive') return j.processing_status !== 'ready';
            return true;
        })
        .filter((j) =>
            (j.job_title || j.title || '').toLowerCase().includes(search.toLowerCase())
        );

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
                    <Button icon={Plus} onClick={() => navigate('/recruiter/jobs/create')}>
                        Create Job
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1">
                        <Input icon={Search} placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Dropdown
                        placeholder="All"
                        value={filter}
                        options={[
                            { value: 'all', label: 'All' },
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                        ]}
                        onSelect={setFilter}
                        className="w-full sm:w-36"
                    />
                </div>

                <JobList jobs={filtered} isLoading={isLoading} isRecruiter onDelete={setDeleteId} emptyMessage="No jobs found" />

                {/* Delete Confirm */}
                <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Job">
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to delete this job? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </div>
                </Modal>
            </motion.div>
        </DashboardLayout>
    );
};

export default JobsManagement;
