import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Briefcase, UserCircle } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { showToast } from '../../components/common/Toast';
import useAuthStore from '../../store/authStore';
import cn from '../../utils/cn';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'candidate',
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { register, isLoading, error } = useAuthStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
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

        try {
            await register(formData.name, formData.email, formData.password, formData.role);
            showToast.success('Account created! Welcome aboard.');
            if (formData.role === 'recruiter') {
                navigate('/recruiter/dashboard');
            } else {
                navigate('/candidate/browse');
            }
        } catch {
            showToast.error(error || 'Registration failed');
        }
    };

    const roleOptions = [
        { value: 'candidate', label: 'Candidate', icon: UserCircle, desc: 'Browse and apply to jobs' },
        { value: 'recruiter', label: 'Recruiter', icon: Briefcase, desc: 'Post jobs and screen candidates' },
    ];

    return (
        <AuthLayout title="Create your account" subtitle="Start screening smarter in minutes">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role Selection */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-dark-300">I am a...</label>
                    <div className="grid grid-cols-2 gap-3">
                        {roleOptions.map((r) => {
                            const Icon = r.icon;
                            return (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: r.value })}
                                    className={cn(
                                        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200',
                                        formData.role === r.value
                                            ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                                            : 'bg-dark-900 border-white/[0.06] text-dark-400 hover:border-white/[0.12]'
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-sm font-semibold">{r.label}</span>
                                    <span className="text-xs text-dark-500">{r.desc}</span>
                                </button>
                            );
                        })}
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
                    type="password"
                    icon={Lock}
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                />
                <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
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
