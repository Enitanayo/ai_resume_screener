import { motion } from 'framer-motion';
import { User, Mail, Briefcase } from 'lucide-react';
import Card from '../../components/common/Card';
import useAuthStore from '../../store/authStore';

const Profile = () => {
    const { user } = useAuthStore();

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-heading font-bold text-dark-50 mb-8">My Profile</h1>

                <Card className="p-8">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">
                                {(user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-dark-50">
                                {user?.name || 'User'}
                            </h2>
                            <p className="text-dark-400 capitalize">{user?.role}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                            <Mail className="w-5 h-5 text-dark-400" />
                            <div>
                                <p className="text-xs text-dark-400">Email</p>
                                <p className="text-sm font-medium text-dark-50">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                            <Briefcase className="w-5 h-5 text-dark-400" />
                            <div>
                                <p className="text-xs text-dark-400">Role</p>
                                <p className="text-sm font-medium text-dark-50 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                            <User className="w-5 h-5 text-dark-400" />
                            <div>
                                <p className="text-xs text-dark-400">Account ID</p>
                                <p className="text-sm font-medium text-dark-50 font-mono">{user?.id || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Profile;
