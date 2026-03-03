import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4
      bg-gradient-to-br from-primary-50 via-white to-purple-50
      dark:from-dark-900 dark:via-dark-900 dark:to-dark-800"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary-600 rounded-xl">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    {title && (
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl
          border border-gray-200 dark:border-dark-700 p-8"
                >
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

export default AuthLayout;
