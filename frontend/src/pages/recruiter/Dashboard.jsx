import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, TrendingUp, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllJobs, getCandidatesByJob } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/analytics/StatsCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [jobCandidateCounts, setJobCandidateCounts] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobsData = await getAllJobs();
                setJobs(jobsData || []);

                // Fetch candidate counts for each job
                const counts = {};
                await Promise.all(
                    (jobsData || []).map(async (job) => {
                        try {
                            const candidates = await getCandidatesByJob(job.id);
                            counts[job.id] = Array.isArray(candidates) ? candidates.length : 0;
                        } catch {
                            counts[job.id] = 0;
                        }
                    })
                );
                setJobCandidateCounts(counts);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <DashboardLayout><Loading text="Loading dashboard..." /></DashboardLayout>;

    const totalCandidates = Object.values(jobCandidateCounts).reduce((sum, c) => sum + c, 0);

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your recruitment activity</p>
                    </div>
                    <Button icon={Plus} onClick={() => navigate('/recruiter/jobs/create')}>
                        Create Job
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <StatsCard
                        label="Total Jobs"
                        value={jobs.length}
                        icon={Briefcase}
                        color="primary"
                    />
                    <StatsCard
                        label="Total Candidates"
                        value={totalCandidates}
                        icon={Users}
                        color="blue"
                    />
                    <StatsCard
                        label="Active Jobs"
                        value={jobs.filter(j => j.processing_status === 'ready').length}
                        icon={TrendingUp}
                        color="green"
                    />
                </div>

                {/* Jobs Overview */}
                {jobs.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Jobs Overview</h2>
                        <Card className="divide-y divide-gray-200 dark:divide-dark-700">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/recruiter/jobs/${job.id}/candidates`)}
                                >
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {job.job_title}
                                        </h3>
                                        <Badge variant={job.processing_status === 'ready' ? 'success' : 'warning'} size="sm" dot>
                                            {job.processing_status === 'ready' ? 'Ready' : job.processing_status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 ml-4">
                                        <Users className="w-4 h-4" />
                                        <span className="font-semibold">{jobCandidateCounts[job.id] || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    </div>
                )}

                {jobs.length === 0 && (
                    <Card className="p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No jobs posted yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first job posting to start screening candidates.</p>
                        <Button icon={Plus} onClick={() => navigate('/recruiter/jobs/create')}>
                            Create Your First Job
                        </Button>
                    </Card>
                )}
            </motion.div>
        </DashboardLayout>
    );
};

export default Dashboard;
