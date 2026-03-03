import { Link } from 'react-router-dom';
import { Sparkles, Github, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary-600 rounded-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                ResumeAI
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            AI-powered resume screening that helps you find the best candidates faster and more fairly.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {[
                                { path: '/', label: 'Home' },
                                { path: '/about', label: 'About' },
                                { path: '/login', label: 'Sign In' },
                                { path: '/register', label: 'Get Started' },
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="mailto:support@resumeai.com"
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    <Mail className="w-4 h-4" /> support@resumeai.com
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com" target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    <Github className="w-4 h-4" /> GitHub
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-700 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} Intelligent Resume Screener. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
