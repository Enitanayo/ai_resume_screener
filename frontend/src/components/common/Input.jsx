import { forwardRef } from 'react';
import cn from '../../utils/cn';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  type = 'text',
  className,
  containerClassName,
  ...props
}, ref) => {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-dark-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-dark-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'block w-full rounded-xl border transition-all duration-200',
            'bg-dark-900 border-white/[0.08]',
            'text-dark-50',
            'placeholder:text-dark-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50',
            error
              ? 'border-red-500/50 focus:ring-red-500/30'
              : 'border-white/[0.08]',
            Icon ? 'pl-10' : 'pl-4',
            RightIcon ? 'pr-10' : 'pr-4',
            'py-2.5',
            className
          )}
          {...props}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-dark-200 transition-colors"
          >
            <RightIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;