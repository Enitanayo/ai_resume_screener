import { memo } from 'react';
import { motion } from 'framer-motion';

const Toggle = memo(({ 
    enabled, 
    onChange, 
    label, 
    description, 
    icon: Icon,
    className = "" 
}) => {
    return (
        <div className={`flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] transition-all duration-300 hover:border-primary-500/20 ${className}`}>
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className={`p-2 rounded-xl ${enabled ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-500'}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <div>
                    <h4 className="text-sm font-semibold text-dark-50">{label}</h4>
                    {description && <p className="text-xs text-dark-400 mt-0.5">{description}</p>}
                </div>
            </div>

            <button
                type="button"
                onClick={() => onChange(!enabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-offset-dark-950 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    enabled ? 'bg-primary-500' : 'bg-dark-700'
                }`}
            >
                <span className="sr-only">{label}</span>
                <motion.span
                    animate={{ x: enabled ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                />
            </button>
        </div>
    );
});

export default Toggle;
