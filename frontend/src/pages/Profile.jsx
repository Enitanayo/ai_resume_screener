import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Briefcase, FileText, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { formatDate } from '../utils/formatters';

const Profile = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

    const displayName = user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';

    const infoItems = [
        { icon: Mail, label: 'Email', value: user?.email || 'N/A' },
        { icon: Shield, label: 'Role', value: user?.role || 'recruiter', isBadge: true },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} className="mb-6">
                Back
            </Button>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Profile Header Card */}
                <Card className="relative overflow-hidden mb-8">
                    {/* Top gradient banner */}
                    <div className="h-32 bg-gradient-to-r from-primary-600 via-purple-500 to-pink-500" />

                    {/* Avatar */}
                    <div className="flex flex-col items-center -mt-16 pb-6 px-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                            className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white dark:border-dark-800"
                        >
                            {displayName[0]?.toUpperCase() || 'U'}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-4 text-2xl font-bold text-gray-900 dark:text-white"
                        >
                            {displayName}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-2"
                        >
                            <Badge
                                variant={isRecruiter ? 'warning' : 'success'}
                                size="lg"
                                dot
                            >
                                {isRecruiter ? 'Recruiter' : 'Candidate'}
                            </Badge>
                        </motion.div>
                    </div>
                </Card>

                {/* Profile Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Details</h2>
                    <Card className="divide-y divide-gray-100 dark:divide-dark-700">
                        {infoItems.map((item, index) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700">
                                        <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                                </div>
                                {item.isBadge ? (
                                    <Badge variant={isRecruiter ? 'warning' : 'success'} size="sm">
                                        {item.value}
                                    </Badge>
                                ) : (
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
                                )}
                            </motion.div>
                        ))}
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8"
                >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {isRecruiter ? (
                            <>
                                <Card hover className="p-4 cursor-pointer" onClick={() => navigate('/recruiter/dashboard')}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                                            <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Dashboard</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">View recruitment activity</p>
                                        </div>
                                    </div>
                                </Card>
                                <Card hover className="p-4 cursor-pointer" onClick={() => navigate('/recruiter/jobs/create')}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Create Job</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Post a new job opening</p>
                                        </div>
                                    </div>
                                </Card>
                            </>
                        ) : (
                            <>
                                <Card hover className="p-4 cursor-pointer" onClick={() => navigate('/candidate/browse')}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                                            <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Browse Jobs</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Find your next opportunity</p>
                                        </div>
                                    </div>
                                </Card>
                                <Card hover className="p-4 cursor-pointer" onClick={() => navigate('/candidate/applications')}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">My Applications</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Track your applications</p>
                                        </div>
                                    </div>
                                </Card>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Profile;
