import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import cn from '../../utils/cn';

const Dropdown = ({
    trigger,
    options = [],
    onSelect,
    placeholder = 'Select...',
    value,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div ref={dropdownRef} className={cn('relative', className)}>
            {trigger ? (
                <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full px-4 py-2.5 text-left
            bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600
            rounded-lg text-gray-900 dark:text-white
            hover:border-primary-500 transition-colors"
                >
                    <span className={!selectedOption ? 'text-gray-400' : ''}>
                        {selectedOption?.label || placeholder}
                    </span>
                    <ChevronDown className={cn(
                        'w-4 h-4 transition-transform',
                        isOpen && 'rotate-180'
                    )} />
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-800
              border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg
              overflow-hidden"
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onSelect(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'w-full px-4 py-2.5 text-left text-sm transition-colors',
                                    'hover:bg-gray-100 dark:hover:bg-dark-700',
                                    option.value === value
                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                        : 'text-gray-700 dark:text-gray-300'
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dropdown;
