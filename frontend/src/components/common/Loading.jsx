import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import cn from '../../utils/cn';

// Spinner component
export const Spinner = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-primary-600 dark:text-primary-400',
        sizeClasses[size],
        className
      )}
    />
  );
};

// Skeleton loader
export const Skeleton = ({ className, ...props }) => (
  <div
    className={cn(
      'animate-pulse-soft bg-gray-200 dark:bg-dark-700 rounded',
      className
    )}
    {...props}
  />
);

// Card skeleton
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6">
    <Skeleton className="h-5 w-2/3 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-4/5 mb-4" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </div>
);

// Full page / inline loading
const Loading = ({
  fullScreen = false,
  text = 'Loading...',
  size = 'md',
  className,
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Spinner size="lg" />
          {text && (
            <p className="text-gray-600 dark:text-gray-400 font-medium">{text}</p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 gap-4', className)}>
      <Spinner size={size} />
      {text && (
        <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );
};

export default Loading;