import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Edit3, Save, X } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { showToast } from '../components/common/Toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import useAuthStore from '../store/authStore';

const Profile = () => {
    const { user, updateProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            if (updateProfile) {
                await updateProfile(formData);
            }
            showToast.success('Profile updated!');
            setIsEditing(false);
        } catch (err) {
            showToast.error('Failed to update profile');
        }
    };

    const content = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${isRecruiter ? 'py-0' : 'py-8'}`}
        >
            {/* Profile Header */}
            <div className="relative mb-8">
                {/* Gradient banner */}
                <div className="h-36 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 overflow-hidden relative">
                    <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                </div>
                <div className="px-6 -mt-12 flex items-end gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-500/20 border-4 border-dark-950">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="pb-2">
                        <h1 className="text-xl font-heading font-bold text-dark-50">{user?.name || 'User'}</h1>
                        <Badge variant={isRecruiter ? 'primary' : 'info'} size="sm">
                            {user?.role || 'Member'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-dark-50">Profile Information</h2>
                    {!isEditing ? (
                        <Button variant="outline" size="sm" icon={Edit3} onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" icon={X} onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button size="sm" icon={Save} onClick={handleSave}>
                                Save
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-5">
                    {isEditing ? (
                        <>
                            <Input
                                label="Name"
                                name="name"
                                icon={User}
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                icon={Mail}
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                <User className="w-5 h-5 text-dark-400" />
                                <div>
                                    <p className="text-xs text-dark-400">Name</p>
                                    <p className="text-sm font-medium text-dark-50">{user?.name || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                <Mail className="w-5 h-5 text-dark-400" />
                                <div>
                                    <p className="text-xs text-dark-400">Email</p>
                                    <p className="text-sm font-medium text-dark-50">{user?.email || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                <Shield className="w-5 h-5 text-dark-400" />
                                <div>
                                    <p className="text-xs text-dark-400">Role</p>
                                    <p className="text-sm font-medium text-dark-50 capitalize">{user?.role || '—'}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </motion.div>
    );

    return isRecruiter ? <DashboardLayout>{content}</DashboardLayout> : content;
};


export default Profile;
