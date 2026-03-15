import { Link } from 'react-router-dom';
import { Sparkles, Github, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark-950 border-t border-white/[0.06] relative">
            {/* Gradient divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-dark-50 font-heading">
                                Smart Screener
                            </span>
                        </div>
                        <p className="text-sm text-dark-400 leading-relaxed max-w-md">
                            AI-powered resume intelligence that helps you find the best candidates faster and more fairly.
                            From resume upload to ranked shortlist in seconds.
                        </p>
                        <p className="text-xs text-dark-500 italic">
                            Built for real hiring teams.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-dark-200 mb-4 uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { path: '/', label: 'Home' },
                                { path: '/about', label: 'About' },
                                { path: '/login', label: 'Sign In' },
                                { path: '/register', label: 'Get Started' },
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-dark-400 hover:text-primary-400 transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-dark-200 mb-4 uppercase tracking-wider">Contact</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="mailto:support@smartscreener.ai"
                                    className="flex items-center gap-2 text-sm text-dark-400 hover:text-primary-400 transition-colors duration-200"
                                >
                                    <Mail className="w-4 h-4" /> support@smartscreener.ai
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com" target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 text-sm text-dark-400 hover:text-primary-400 transition-colors duration-200"
                                >
                                    <Github className="w-4 h-4" /> GitHub
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/[0.06]">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-dark-500">
                            &copy; {new Date().getFullYear()} Smart Screener. All rights reserved.
                        </p>
                        <p className="text-sm text-dark-400 font-medium">
                            Built for intelligent hiring. <span className="text-primary-400">Available today.</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
