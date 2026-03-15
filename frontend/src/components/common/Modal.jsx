import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import cn from '../../utils/cn';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className,
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            'relative w-full bg-dark-800 rounded-2xl shadow-2xl shadow-black/40',
                            'border border-white/[0.06]',
                            sizeClasses[size],
                            className
                        )}
                    >
                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                                <h2 className="text-lg font-semibold text-dark-50">
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-xl text-dark-400 hover:text-dark-200 hover:bg-white/[0.04] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Body */}
                        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
