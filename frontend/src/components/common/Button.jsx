import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import cn from '../../utils/cn';

const variants = {
  primary: 'btn-gradient text-white shadow-lg shadow-indigo-500/20',
  secondary: 'bg-dark-800 text-dark-50 hover:bg-dark-700 border border-white/[0.06]',
  outline: 'border border-white/[0.1] text-dark-100 hover:bg-white/[0.04] hover:border-primary-500/30',
  ghost: 'text-dark-300 hover:text-dark-50 hover:bg-white/[0.04]',
  danger: 'bg-red-600/90 text-white hover:bg-red-600 shadow-lg shadow-red-500/15',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 focus:ring-offset-dark-950',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;