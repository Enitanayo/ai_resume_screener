import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, MapPin, Phone } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { showToast } from '../../components/common/Toast';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 1000));
        showToast.success('Message sent! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-16 px-4">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Have questions about ResumeAI? We'd love to hear from you.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        {[
                            { icon: Mail, label: 'Email', value: 'support@resumeai.com' },
                            { icon: Phone, label: 'Phone', value: '+1 (555) 000-0000' },
                            { icon: MapPin, label: 'Location', value: 'San Francisco, CA' },
                        ].map((item) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <Card className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                                            <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{item.value}</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-2"
                    >
                        <Card className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Name"
                                        placeholder="Your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        icon={Mail}
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Message
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="How can we help?"
                                        value={formData.message}
                                        onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                                        className="block w-full rounded-lg border border-gray-300 dark:border-dark-600
                      bg-white dark:bg-dark-800 text-gray-900 dark:text-white
                      placeholder:text-gray-400 px-4 py-2.5 focus:outline-none
                      focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                    />
                                </div>
                                <Button type="submit" variant="primary" size="lg" icon={Send} isLoading={isLoading}>
                                    Send Message
                                </Button>
                            </form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
