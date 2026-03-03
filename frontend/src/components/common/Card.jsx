import { forwardRef } from 'react';
import cn from '../../utils/cn';

const Card = forwardRef(({
  children,
  hover = false,
  glass = false,
  padding = true,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border transition-all duration-200',
        glass
          ? 'glass'
          : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700',
        hover && 'card-hover cursor-pointer',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Sub-components
export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm text-gray-500 dark:text-gray-400', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('mt-4 pt-4 border-t border-gray-200 dark:border-dark-700', className)} {...props}>
    {children}
  </div>
);

export default Card;