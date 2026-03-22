import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Briefcase, MapPin, Clock } from 'lucide-react';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import { useNavigate } from 'react-router-dom';
import { getAllJobs } from '../../services/api';
import { formatDate } from '../../utils/formatters';

const JobBrowse = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getAllJobs();
                console.log("Jobs received in frontend:", data);
                // Show all jobs during testing phase
                setJobs(data || []);
                setFilteredJobs(data || []);
            } catch (err) {
                console.error("Error fetching jobs:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            setFilteredJobs(
                jobs.filter((j) =>
                    (j.job_title || j.title || '').toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredJobs(jobs);
        }
    }, [searchQuery, jobs]);

    if (isLoading) return <Loading text="Loading jobs..." />;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
            <div className="mb-8">
                <h1 className="text-2xl font-heading font-bold text-dark-50">Browse Jobs</h1>
                <p className="text-dark-400 text-sm mt-1">Find and apply to positions that match your skills</p>
            </div>

            <div className="mb-6">
                <Input
                    icon={Search}
                    placeholder="Search jobs by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredJobs.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                    {filteredJobs.map((job, index) => {
                        const skills = job.required_skills || [];
                        const jobId = job.$id || job.id;

                        return (
                            <motion.div
                                key={jobId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                            >
                                <Card
                                    hover
                                    className="p-6 h-full cursor-pointer hover:border-primary-500/15"
                                    onClick={() => navigate(`/candidate/jobs/${jobId}`)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-primary-500/10">
                                                <Briefcase className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-dark-50">
                                                    {job.job_title || job.title}
                                                </h3>
                                                <span className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(job.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="success" size="sm" dot>Active</Badge>
                                    </div>

                                    <p className="text-sm text-dark-400 line-clamp-2 mb-4">
                                        {job.job_description || job.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5">
                                        {skills.slice(0, 4).map((skill) => (
                                            <Badge key={skill} variant="primary" size="sm">{skill}</Badge>
                                        ))}
                                        {skills.length > 4 && (
                                            <Badge variant="neutral" size="sm">+{skills.length - 4}</Badge>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Briefcase className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-dark-50 mb-2">No jobs available</h3>
                    <p className="text-dark-400">
                        {jobs.length === 0
                            ? 'No job postings are available right now. Check back later!'
                            : 'No jobs match your search.'}
                    </p>
                </Card>
            )}
        </motion.div>
    );
};

export default JobBrowse;
