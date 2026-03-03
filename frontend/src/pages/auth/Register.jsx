import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserCheck } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/authStore';
import { validateRegisterForm } from '../../utils/validators';
import { showToast } from '../../components/common/Toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'candidate',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = validateRegisterForm(formData);
        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        setIsLoading(true);
        try {
            const result = await register(
                formData.email,
                formData.password,
                formData.name,
                formData.role
            );

            if (result?.success) {
                showToast.success('Account created! You are now logged in.');
                if (formData.role === 'recruiter') {
                    navigate('/recruiter/dashboard');
                } else {
                    navigate('/candidate/browse');
                }
            } else {
                // Parse errors
                const errorMsg = (result?.error || '').toLowerCase();
                const newErrors = {};

                if (errorMsg.includes('password')) {
                    if (errorMsg.includes('short') || errorMsg.includes('8')) {
                        newErrors.password = 'Password must be at least 8 characters';
                    } else {
                        newErrors.password = 'Invalid password format';
                    }
                } else if (errorMsg.includes('email') || errorMsg.includes('user already exists')) {
                    newErrors.email = 'Account with this email already exists';
                } else if (errorMsg.includes('name')) {
                    newErrors.name = 'Please enter a valid name';
                } else {
                    // Fallback
                    showToast.error(result?.error || 'Registration failed');
                }

                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                }
            }
        } catch (err) {
            // Fallback for unexpected exceptions
            showToast.error(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Create an account" subtitle="Join ResumeAI and streamline your hiring">
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Full Name"
                    name="name"
                    icon={User}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                />
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
                <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    icon={Lock}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                />

                {/* Role select */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        I am a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: 'candidate', label: 'Candidate', icon: User },
                            { value: 'recruiter', label: 'Recruiter', icon: UserCheck },
                        ].map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, role: value }))}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all
                  ${formData.role === value
                                        ? 'border-primary-600 bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:border-primary-400 dark:text-primary-400'
                                        : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                        ⚠ Your role cannot be changed after registration.
                    </p>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                    Create Account
                </Button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Register;
