import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/authStore';
import { validateLoginForm } from '../../utils/validators';
import { showToast } from '../../components/common/Toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = validateLoginForm(formData);
        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        // Login via backend JWT auth
        const result = await login(formData.email, formData.password);

        if (result?.error) {
            const errorMsg = result.error.toLowerCase();
            const newErrors = {};

            // Parse error messages and map to fields
            if (errorMsg.includes('password') || errorMsg.includes('credentials')) {
                newErrors.password = 'Invalid email or password';
            }
            if (errorMsg.includes('email') || errorMsg.includes('user not found')) {
                newErrors.email = 'Please check your email address'; // Start with email for "not found" to avoid leaking existence, or just stick to generic creds
                // actually, for "invalid credentials" typically we flag both or just password. 
                // Let's be specific if the error is specific about format.
            }

            // "Invalid credentials" usually means the combo is wrong.
            if (errorMsg.includes('invalid credentials')) {
                newErrors.password = 'Incorrect email or password';
                newErrors.email = ' '; // Highlight border only
            } else if (errorMsg.includes('password')) {
                // Specific password format error (rare for login, but possible)
                newErrors.password = 'Invalid password format';
            } else if (errorMsg.includes('email')) {
                newErrors.email = 'Invalid email address';
            } else {
                // Fallback for unknown errors
                showToast.error(result.error);
                return;
            }

            setErrors(newErrors);
        } else {
            showToast.success('Welcome back!');
            if (result.role === 'recruiter' || result.role === 'admin') {
                navigate('/recruiter/dashboard');
            } else {
                navigate('/candidate/browse');
            }
        }
    };

    return (
        <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Email"
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
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                    Sign In
                </Button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium">
                        Sign up
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Login;
