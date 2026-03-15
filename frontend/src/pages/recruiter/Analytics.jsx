import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllJobs, getCandidatesByJob } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RecruitmentMetrics from '../../components/analytics/RecruitmentMetrics';
import Charts from '../../components/analytics/Charts';
import Loading from '../../components/common/Loading';
import Dropdown from '../../components/common/Dropdown';

const Analytics = () => {
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const jobsData = await getAllJobs();
                setJobs(jobsData);

                const allCandidates = [];
                for (const job of jobsData.slice(0, 10)) {
                    try {
                        const candidates = await getCandidatesByJob(job.id);
                        allCandidates.push(...candidates);
                    } catch {
                        // Skip jobs with no candidates
                    }
                }
                setCandidates(allCandidates);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    if (isLoading) return <DashboardLayout><Loading text="Loading analytics..." /></DashboardLayout>;

    const jobOptions = [
        { value: 'all', label: 'All Jobs' },
        ...jobs.map((j) => ({ value: j.id, label: j.title })),
    ];

    const filteredCandidates = selectedJobId === 'all'
        ? candidates
        : candidates.filter((c) => c.job_id === selectedJobId);

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-dark-50">Analytics</h1>
                        <p className="text-dark-400 mt-1">Recruitment insights and metrics</p>
                    </div>
                    <Dropdown
                        value={selectedJobId}
                        options={jobOptions}
                        onSelect={setSelectedJobId}
                        className="w-full sm:w-56 mt-4 sm:mt-0"
                    />
                </div>

                <div className="space-y-8">
                    <RecruitmentMetrics jobs={jobs} candidates={filteredCandidates} />
                    <Charts candidates={filteredCandidates} />
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default Analytics;
