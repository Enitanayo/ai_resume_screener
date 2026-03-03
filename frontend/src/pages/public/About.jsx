import { motion } from 'framer-motion';
import { Target, Shield, Zap, Users, Award, BarChart3 } from 'lucide-react';
import Card from '../../components/common/Card';

const features = [
    {
        icon: Target,
        title: 'AI-Powered Matching',
        description: 'Our intelligent algorithms analyze resumes against job requirements for precise candidate matching.',
    },
    {
        icon: Shield,
        title: 'Bias-Free Screening',
        description: 'Objective evaluation based on skills and experience, promoting diversity and fair hiring practices.',
    },
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: 'Screen hundreds of resumes in minutes, not hours. Focus your time on the best candidates.',
    },
    {
        icon: Users,
        title: 'Team Collaboration',
        description: 'Share candidate profiles and evaluations with your hiring team seamlessly.',
    },
    {
        icon: Award,
        title: 'Smart Scoring',
        description: 'Multi-dimensional scoring across skills, experience, and contextual relevance for accurate rankings.',
    },
    {
        icon: BarChart3,
        title: 'Analytics Dashboard',
        description: 'Track hiring metrics, candidate trends, and recruitment performance in real-time.',
    },
];

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
            {/* Hero */}
            <section className="relative py-20 px-4 bg-gradient-to-br from-primary-600 to-purple-700 text-white overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto text-center relative z-10"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        About ResumeAI
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                        We're building the future of recruitment with AI-powered resume screening
                        that's faster, fairer, and smarter.
                    </p>
                </motion.div>
            </section>

            {/* Mission */}
            <section className="max-w-4xl mx-auto px-4 py-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                        Traditional resume screening is slow, biased, and inconsistent. We use advanced NLP
                        and machine learning to evaluate candidates objectively, helping companies find the
                        best talent faster while giving every candidate a fair chance.
                    </p>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="p-6 h-full">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg w-fit mb-4">
                                    <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default About;
