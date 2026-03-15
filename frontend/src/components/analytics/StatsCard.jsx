import { motion } from 'framer-motion';
import cn from '../../utils/cn';

const StatsCard = ({ label, value, icon: Icon, trend, color = 'primary', className }) => {
    const colorClasses = {
        primary: 'bg-primary-500/10 text-primary-400',
        green: 'bg-emerald-500/10 text-emerald-400',
        blue: 'bg-blue-500/10 text-blue-400',
        yellow: 'bg-amber-500/10 text-amber-400',
        purple: 'bg-purple-500/10 text-purple-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={cn(
                'bg-dark-800 rounded-2xl border border-white/[0.06] p-6',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-dark-400 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-dark-50 font-mono">{value}</p>
                    {trend && (
                        <p className={cn(
                            'text-xs mt-1 flex items-center gap-1',
                            trend > 0 ? 'text-emerald-400' : 'text-red-400'
                        )}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={cn('p-3 rounded-xl', colorClasses[color])}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StatsCard;
