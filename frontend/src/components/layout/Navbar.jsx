import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, LogOut, LayoutDashboard, Briefcase, User, ChevronDown, BookOpen, Layers, BarChart3 } from 'lucide-react';
import Button from '../common/Button';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = isAuthenticated
    ? user?.role === 'recruiter' || user?.role === 'admin'
      ? [
        { path: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/recruiter/jobs', label: 'Jobs', icon: Briefcase },
      ]
      : [
        { path: '/candidate/browse', label: 'Browse Jobs', icon: Briefcase },
        { path: '/candidate/applications', label: 'My Applications', icon: User },
        { path: '/candidate/analytics', label: 'Analytics', icon: BarChart3 },
      ]
    : [
      { path: '/', label: 'Home' },
      // "Features" and "Resources" will be handled as dropdowns below
      { path: '/about', label: 'About Us' },
      { path: '/contact', label: 'Contact' },
    ];

  const featuresLinks = [
    { label: 'AI Screening', desc: 'Automated resume ranking' },
    { label: 'Bias Reduction', desc: 'Fair hiring practices' },
    { label: 'Analytics', desc: 'Hiring insights' },
  ];

  const resourcesLinks = [
    { label: 'Blog', desc: 'Latest hiring trends' },
    { label: 'Case Studies', desc: 'Success stories' },
    { label: 'Help Center', desc: 'Guides & support' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md border-b border-gray-100 dark:border-dark-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20"> {/* Increased height from h-16 to h-20 */}

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* <div className="p-2 bg-primary-600 rounded-xl shadow-lg shadow-primary-600/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div> */}
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              Smart Screener
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">

            {/* Standard Links (Home, About, Contact) */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(link.path)
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-800'
                  }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}

            {!isAuthenticated && (
              <>
                {/* Features Dropdown */}
                <div
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown('features')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Layers className="w-4 h-4" /> Features <ChevronDown className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'features' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 w-64 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-100 dark:border-dark-700 p-2 mt-2"
                      >
                        {featuresLinks.map((item) => (
                          <div key={item.label} className="block px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50 cursor-pointer transition-colors group/item">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400">
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Resources Dropdown */}
                <div
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown('resources')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <BookOpen className="w-4 h-4" /> Resources <ChevronDown className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'resources' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 w-64 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-100 dark:border-dark-700 p-2 mt-2"
                      >
                        {resourcesLinks.map((item) => (
                          <div key={item.label} className="block px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50 cursor-pointer transition-colors group/item">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400">
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right hidden lg:block">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium capitalize">{user?.role}</div>
                </div>
                <Link to="/profile" className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20 hover:scale-110 transition-transform cursor-pointer">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Link>
                <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout} className="text-gray-500 hover:text-red-600 hover:bg-red-50">

                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-4 py-2">
                  Sign In
                </Link>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 transition-all transform hover:-translate-y-0.5"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors focus:ring-2 focus:ring-primary-500/20"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 dark:border-dark-800 bg-white dark:bg-dark-900 overflow-hidden shadow-xl"
          >
            <div className="px-4 py-6 space-y-4">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors
                      ${isActive(link.path)
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800'
                      }`}
                  >
                    {link.icon && <link.icon className="w-5 h-5" />}
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-dark-800">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Button fullWidth size="lg" variant="ghost" className="justify-center" onClick={() => { navigate('/login'); setIsMobileOpen(false); }}>
                      Sign In
                    </Button>
                    <Button fullWidth size="lg" className="justify-center shadow-lg" onClick={() => { navigate('/register'); setIsMobileOpen(false); }}>
                      Get Started Free
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;