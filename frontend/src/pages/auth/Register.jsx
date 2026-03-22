import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Briefcase, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { showToast } from '../../components/common/Toast';
import useAuthStore from '../../store/authStore';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'recruiter', // Default to recruiter
    });
    // Unified visibility state for both password fields
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { register, isLoading, error } = useAuthStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleRoleSelect = (selectedRole) => {
        setFormData({ ...formData, role: selectedRole });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 8)
            newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = 'Passwords do not match';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const result = await register(formData.email, formData.password, formData.name, formData.role);
        if (result?.success) {
            showToast.success('Account created! Welcome aboard.');
            if (result.role === 'recruiter' || result.role === 'admin') {
                navigate('/recruiter/dashboard');
            } else {
                navigate('/candidate/browse');
            }
        } else {
            showToast.error(result?.error || error || 'Registration failed');
        }
    };

    return (
        <AuthLayout title="Create your account" subtitle="Start screening smarter in minutes">
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Role Selection UI */}
                <div>
                    <label className="block text-sm font-medium text-dark-200 mb-3">
                        I want to use the platform as a:
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Recruiter Option */}
                        <div 
                            onClick={() => handleRoleSelect('recruiter')}
                            className={`relative p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 flex flex-col items-center text-center gap-2
                                ${formData.role === 'recruiter' 
                                    ? 'bg-primary-500/10 border-primary-500 shadow-lg shadow-primary-500/20' 
                                    : 'bg-dark-800 border-white/[0.06] hover:bg-dark-700 hover:border-white/[0.1]'}`}
                        >
                            <div className={`p-3 rounded-full ${formData.role === 'recruiter' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400'}`}>
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${formData.role === 'recruiter' ? 'text-primary-400' : 'text-dark-50'}`}>Recruiter</h3>
                                <p className="text-xs text-dark-400 mt-1">Hire top talent</p>
                            </div>
                            {formData.role === 'recruiter' && (
                                <motion.div layoutId="roleIndicator" className="absolute inset-0 border-2 border-primary-500 rounded-xl" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                            )}
                        </div>

                        {/* Candidate Option */}
                        <div 
                            onClick={() => handleRoleSelect('candidate')}
                            className={`relative p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 flex flex-col items-center text-center gap-2
                                ${formData.role === 'candidate' 
                                    ? 'bg-primary-500/10 border-primary-500 shadow-lg shadow-primary-500/20' 
                                    : 'bg-dark-800 border-white/[0.06] hover:bg-dark-700 hover:border-white/[0.1]'}`}
                        >
                            <div className={`p-3 rounded-full ${formData.role === 'candidate' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400'}`}>
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${formData.role === 'candidate' ? 'text-primary-400' : 'text-dark-50'}`}>Candidate</h3>
                                <p className="text-xs text-dark-400 mt-1">Find your next job</p>
                            </div>
                            {formData.role === 'candidate' && (
                                <motion.div layoutId="roleIndicator" className="absolute inset-0 border-2 border-primary-500 rounded-xl" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                            )}
                        </div>
                    </div>
                </div>

                <Input
                    label="Full Name"
                    name="name"
                    icon={User}
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                />
                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={Mail}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                />
                <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    icon={Lock}
                    rightIcon={showPassword ? EyeOff : Eye}
                    onRightIconClick={() => setShowPassword(!showPassword)}
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                />
                <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    icon={Lock}
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                />

                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-xl">{error}</p>
                )}

                <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                    icon={ArrowRight}
                    iconPosition="right"
                >
                    Create Account
                </Button>
            </form>

            <p className="text-center text-sm text-dark-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
};

export default Register;
