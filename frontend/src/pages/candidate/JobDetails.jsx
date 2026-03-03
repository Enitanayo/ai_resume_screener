import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getJobById } from '../../services/api';
import JobDetailsComp from '../../components/jobs/JobDetails';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getJobById(id);
                setJob(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (isLoading) return <Loading text="Loading job details..." />;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button
                variant="ghost"
                icon={ArrowLeft}
                onClick={() => navigate(-1)}
                className="mb-6"
            >
                Back
            </Button>

            <JobDetailsComp
                job={job}
                onApply={() => navigate(`/candidate/apply/${id}`)}
            />
        </div>
    );
};

export default JobDetails;
