import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    BarChart3,
    PlusCircle,
    Upload,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import cn from '../../utils/cn';

const sidebarLinks = [
    { path: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/recruiter/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/recruiter/jobs/create', label: 'Create Job', icon: PlusCircle },
    { path: '/recruiter/batch-upload', label: 'Batch Upload', icon: Upload },
    { path: '/recruiter/analytics', label: 'Analytics', icon: BarChart3 },
];

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <motion.aside
            animate={{ width: isCollapsed ? 72 : 256 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:flex flex-col h-[calc(100vh-64px)] sticky top-16
        bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700"
        >
            <nav className="flex-1 p-3 space-y-1">
                {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                isActive(link.path)
                                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700'
                            )}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span>{link.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <div className="p-3 border-t border-gray-200 dark:border-dark-700">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center justify-center w-full py-2 rounded-lg
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
            hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
