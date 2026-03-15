import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RefreshCcw, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';

const ServerError = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="p-4 bg-red-500/10 rounded-2xl w-fit mx-auto mb-6">
                    <AlertTriangle className="w-12 h-12 text-red-400" />
                </div>
                <h1 className="text-6xl font-bold text-red-400 mb-4 font-heading">500</h1>
                <h2 className="text-2xl font-bold text-dark-50 mb-4">Server Error</h2>
                <p className="text-dark-400 mb-8">
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
