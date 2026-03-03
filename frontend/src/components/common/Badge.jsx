import cn from '../../utils/cn';

const variantStyles = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-dark-700 dark:text-gray-300',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
};

const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};

const Badge = ({
    children,
    variant = 'neutral',
    size = 'md',
    dot = false,
    className,
    ...props
}) => {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 font-medium rounded-full',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    variant === 'success' && 'bg-green-500',
                    variant === 'warning' && 'bg-yellow-500',
                    variant === 'danger' && 'bg-red-500',
                    variant === 'info' && 'bg-blue-500',
                    variant === 'neutral' && 'bg-gray-500',
                    variant === 'primary' && 'bg-primary-500',
                )} />
            )}
            {children}
        </span>
    );
};

export default Badge;
