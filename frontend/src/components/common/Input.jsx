import { forwardRef } from 'react';
import cn from '../../utils/cn';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  className,
  containerClassName,
  ...props
}, ref) => {
  return (
    <div className={cn('space-y-1', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'block w-full rounded-lg border transition-all duration-200',
            'bg-white dark:bg-dark-800',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-dark-600',
            Icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;