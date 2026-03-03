import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { getAllJobs } from '../../services/api';
import JobList from '../../components/jobs/JobList';
import Input from '../../components/common/Input';
import useDebounce from '../../hooks/useDebounce';

const JobBrowse = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true);
            try {
                const data = await getAllJobs();
                setJobs(data || []);
            } catch (err) {
                console.error('Failed to load jobs:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const filtered = jobs.filter((job) =>
        (job.job_title || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (job.job_description || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Jobs</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Find your next opportunity</p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:w-72">
                        <Input
                            icon={Search}
                            placeholder="Search jobs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <JobList
                    jobs={filtered}
                    isLoading={isLoading}
                    emptyMessage="No jobs available right now. Check back soon!"
                />
            </motion.div>
        </div>
    );
};

export default JobBrowse;
