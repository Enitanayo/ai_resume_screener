import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RefreshCcw, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';

const ServerError = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-6">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-6xl font-bold text-red-500 mb-4">500</h1>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Server Error</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Something went wrong on our end. Please try again later.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="secondary" icon={RefreshCcw} onClick={() => window.location.reload()}>
                        Refresh
                    </Button>
                    <Button variant="primary" icon={Home} onClick={() => navigate('/')}>
                        Home
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default ServerError;
