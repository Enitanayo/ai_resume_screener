import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { showToast } from '../../components/common/Toast';
import useAuthStore from '../../store/authStore';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { login, isLoading, error } = useAuthStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
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
            const user = await login(formData.email, formData.password);
            showToast.success('Welcome back!');
            if (user?.role === 'recruiter' || user?.role === 'admin') {
                navigate('/recruiter/dashboard');
            } else {
                navigate('/candidate/browse');
            }
        } catch {
            showToast.error(error || 'Login failed');
        }
    };

    return (
        <AuthLayout title="Welcome back" subtitle="Sign in to continue to your dashboard">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
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
                    Sign In
                </Button>
            </form>

            <p className="text-center text-sm text-dark-400 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                    Create one
                </Link>
            </p>
        </AuthLayout>
    );
};

export default Login;
