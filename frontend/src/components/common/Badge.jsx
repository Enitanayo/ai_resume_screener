import cn from '../../utils/cn';

const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    neutral: 'bg-white/[0.04] text-dark-300 border border-white/[0.06]',
    primary: 'bg-primary-500/10 text-primary-400 border border-primary-500/20',
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
                'inline-flex items-center gap-1.5 font-medium rounded-full backdrop-blur-sm',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    variant === 'success' && 'bg-emerald-400',
                    variant === 'warning' && 'bg-amber-400',
                    variant === 'danger' && 'bg-red-400',
                    variant === 'info' && 'bg-blue-400',
                    variant === 'neutral' && 'bg-dark-400',
                    variant === 'primary' && 'bg-primary-400',
                )} />
            )}
            {children}
        </span>
    );
};

export default Badge;
