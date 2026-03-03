import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { showToast } from '../../components/common/Toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            showToast.error('Please enter your email');
            return;
        }
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitted(true);
        setIsLoading(false);
        showToast.success('Password reset email sent!');
    };

    return (
        <AuthLayout
            title={isSubmitted ? 'Check your email' : 'Reset your password'}
            subtitle={isSubmitted
                ? `We've sent a password reset link to ${email}`
                : 'Enter your email and we\'ll send you a reset link'
            }
        >
            {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Email"
                        type="email"
                        icon={Mail}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                        Send Reset Link
                    </Button>
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to sign in
                    </Link>
                </form>
            ) : (
                <div className="space-y-5 text-center">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full w-fit mx-auto">
                        <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Didn't receive the email? Check your spam folder or{' '}
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-primary-600 hover:text-primary-500 font-medium"
                        >
                            try again
                        </button>
                    </p>
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to sign in
                    </Link>
                </div>
            )}
        </AuthLayout>
    );
};

export default ForgotPassword;
