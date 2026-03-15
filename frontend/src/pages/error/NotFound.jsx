import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <h1 className="text-8xl font-bold text-primary-400 mb-4 font-heading">404</h1>
                <h2 className="text-2xl font-bold text-dark-50 mb-4">Page Not Found</h2>
                <p className="text-dark-400 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                    <Button variant="primary" icon={Home} onClick={() => navigate('/')}>
                        Home
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
