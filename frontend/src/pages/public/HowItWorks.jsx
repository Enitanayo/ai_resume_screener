import { motion } from 'framer-motion';
import { Upload, Search, BarChart3, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

const steps = [
    {
        icon: Upload,
        title: 'Post a Job',
        description: 'Create a job posting with required skills and a detailed description of the ideal candidate.',
        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
        icon: Search,
        title: 'Collect Resumes',
        description: 'Candidates apply with their resumes. Our AI instantly extracts and parses the content.',
        color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
    {
        icon: BarChart3,
        title: 'AI Scoring',
        description: 'Each resume is scored on multiple dimensions: skill match, experience relevance, and context.',
        color: 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    },
    {
        icon: Users,
        title: 'Review & Hire',
        description: 'Review ranked candidates, compare scores, and make data-driven hiring decisions.',
        color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    },
];

const HowItWorks = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
            {/* Header */}
            <section className="py-20 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        How It Works
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        From posting a job to finding the perfect candidate — in four simple steps.
                    </p>
                </motion.div>
            </section>

            {/* Steps */}
            <section className="max-w-4xl mx-auto px-4 pb-20">
                <div className="space-y-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="flex items-start gap-6 bg-white dark:bg-dark-800 rounded-2xl p-8
                border border-gray-200 dark:border-dark-700 shadow-sm"
                        >
                            {/* Step Number */}
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-primary-600 text-white
                  flex items-center justify-center text-lg font-bold">
                                    {index + 1}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${step.color}`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {step.title}
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Ready to get started?
                    </h3>
                    <Button
                        variant="primary"
                        size="xl"
                        icon={ArrowRight}
                        iconPosition="right"
                        onClick={() => navigate('/register')}
                    >
                        Create Your Account
                    </Button>
                </motion.div>
            </section>
        </div>
    );
};

export default HowItWorks;
