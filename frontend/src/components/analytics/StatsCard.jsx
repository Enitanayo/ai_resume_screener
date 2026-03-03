import { motion } from 'framer-motion';
import cn from '../../utils/cn';

const StatsCard = ({ label, value, icon: Icon, trend, color = 'primary', className }) => {
    const colorClasses = {
        primary: 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
        green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
        purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={cn(
                'bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {trend && (
                        <p className={cn(
                            'text-xs mt-1 flex items-center gap-1',
                            trend > 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={cn('p-3 rounded-lg', colorClasses[color])}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StatsCard;
