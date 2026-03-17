import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4
      bg-dark-950 relative overflow-hidden"
        >
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/5 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-1 rounded-2xl bg-white shadow-lg shadow-indigo-500/10">
                            <img src={logo} alt="Smart Screener Logo" className="w-12 h-12 object-contain" />
                        </div>
                    </div>
                    {title && (
                        <h1 className="text-2xl font-bold text-dark-50 font-heading">
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="mt-2 text-dark-400">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Form Card */}
                <div className="bg-dark-800 rounded-2xl shadow-2xl shadow-black/30
          border border-white/[0.06] p-8"
                >
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

export default AuthLayout;
