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
            bg-dark-900 border border-white/[0.08]
            rounded-xl text-dark-50
            hover:border-primary-500/30 transition-all duration-200"
                >
                    <span className={!selectedOption ? 'text-dark-400' : ''}>
                        {selectedOption?.label || placeholder}
                    </span>
                    <ChevronDown className={cn(
                        'w-4 h-4 text-dark-400 transition-transform',
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
                        className="absolute z-50 w-full mt-1 bg-dark-800
              border border-white/[0.06] rounded-xl shadow-2xl shadow-black/40
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
                                    'hover:bg-white/[0.04]',
                                    option.value === value
                                        ? 'text-primary-400 bg-primary-500/10'
                                        : 'text-dark-200'
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
