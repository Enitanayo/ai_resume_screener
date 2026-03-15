import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, Upload, Users, TrendingUp, BarChart3 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatsCard from '../../components/analytics/StatsCard';
import JobList from '../../components/jobs/JobList';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAllJobs, getCandidatesByJob } from '../../services/api';

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCandidates, setTotalCandidates] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const jobsData = await getAllJobs();
                setJobs(jobsData);

                let candidateCount = 0;
                for (const job of jobsData.slice(0, 5)) {
                    try {
                        const candidates = await getCandidatesByJob(job.$id || job.id);
                        candidateCount += candidates.length;
                    } catch { }
                }
                setTotalCandidates(candidateCount);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const readyJobs = jobs.filter((j) => j.processing_status === 'ready').length;

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-dark-50">Dashboard</h1>
                        <p className="text-dark-400 text-sm mt-1">Welcome back. Here's your recruitment activity.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" icon={Upload} onClick={() => navigate('/recruiter/batch-upload')}>
                            Batch Upload
                        </Button>
                        <Button icon={PlusCircle} onClick={() => navigate('/recruiter/jobs/create')}>
                            Create Job
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard label="Total Jobs" value={jobs.length} icon={Briefcase} color="primary" />
                    <StatsCard label="Active Jobs" value={readyJobs} icon={TrendingUp} color="green" />
                    <StatsCard label="Total Candidates" value={totalCandidates} icon={Users} color="blue" />
                    <StatsCard label="Avg. Score" value="—" icon={BarChart3} color="purple" />
                </div>

                {/* Recent Jobs */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-heading font-semibold text-dark-50">Recent Jobs</h2>
                        <Link to="/recruiter/jobs" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
                            View all →
                        </Link>
                    </div>
                    <JobList jobs={jobs.slice(0, 6)} isLoading={isLoading} isRecruiter />
                </div>
            </motion.div>
        </DashboardLayout>
    );
};


export default Dashboard;
