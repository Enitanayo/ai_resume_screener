import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <h1 className="text-8xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
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
