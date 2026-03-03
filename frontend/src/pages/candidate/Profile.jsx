import { motion } from 'framer-motion';
import { User, Mail, Briefcase } from 'lucide-react';
import Card from '../../components/common/Card';
import useAuthStore from '../../store/authStore';

const Profile = () => {
    const { user } = useAuthStore();

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>

                <Card className="p-8">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30
              flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                {(user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {user?.name || 'User'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-900 rounded-lg">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-900 rounded-lg">
                            <Briefcase className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-900 rounded-lg">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Account ID</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.id || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Profile;
