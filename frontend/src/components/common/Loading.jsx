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
        'animate-spin text-primary-400',
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
      'shimmer rounded-lg',
      className
    )}
    {...props}
  />
);

// Card skeleton
export const CardSkeleton = () => (
  <div className="bg-dark-800 rounded-2xl border border-white/[0.06] p-6">
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Spinner size="lg" />
          {text && (
            <p className="text-dark-300 font-medium">{text}</p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 gap-4', className)}>
      <Spinner size={size} />
      {text && (
        <p className="text-dark-400 text-sm">{text}</p>
      )}
    </div>
  );
};

export default Loading;