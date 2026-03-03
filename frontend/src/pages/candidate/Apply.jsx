import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getJobById } from '../../services/api';
import ApplicationForm from '../../components/application/ApplicationForm';
import ApplicationStatus from '../../components/application/ApplicationStatus';
import JobDetailsComp from '../../components/jobs/JobDetails';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const Apply = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [applicationResult, setApplicationResult] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getJobById(jobId);
                setJob(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [jobId]);

    if (isLoading) return <Loading text="Loading job..." />;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} className="mb-6">
                Back
            </Button>

            {applicationResult ? (
                <div className="space-y-6">
                    <ApplicationStatus
                        status={applicationResult.status || 'pending'}
                        score={applicationResult.score_breakdown?.total_score}
                        candidateId={applicationResult.candidate_id}
                    />
                    <div className="text-center">
                        <Button variant="secondary" onClick={() => navigate('/candidate/browse')}>
                            Browse More Jobs
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {job && <JobDetailsComp job={job} />}
                    <ApplicationForm job={job} onSuccess={setApplicationResult} />
                </div>
            )}
        </div>
    );
};

export default Apply;
