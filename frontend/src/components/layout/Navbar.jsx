import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, LogOut, LayoutDashboard, Briefcase, User, ChevronDown, BookOpen, Layers, BarChart3 } from 'lucide-react';
import Button from '../common/Button';
import useAuthStore from '../../store/authStore';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll detection for glass effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={`sticky top-0 z-40 transition-all duration-500 ${isScrolled
        ? 'bg-dark-950/70 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/10'
        : 'bg-transparent border-b border-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-sm shadow-black/5 flex items-center justify-center">
              <img src={logo} alt="Smart Screener Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-dark-50 tracking-tight hidden sm:block group-hover:text-primary-400 transition-colors font-heading">
              Smart Screener
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">

            {/* Standard Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive(link.path)
                    ? 'text-primary-400 bg-primary-500/10'
                    : 'text-dark-300 hover:text-dark-50 hover:bg-white/[0.04]'
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
                  <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-dark-300 hover:text-dark-50 transition-colors">
                    <Layers className="w-4 h-4" /> Features <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'features' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 w-64 bg-dark-800 rounded-2xl shadow-2xl shadow-black/40 border border-white/[0.06] p-2 mt-2"
                      >
                        {featuresLinks.map((item) => (
                          <div key={item.label} className="block px-4 py-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors group/item">
                            <div className="text-sm font-semibold text-dark-50 group-hover/item:text-primary-400">
                              {item.label}
                            </div>
                            <div className="text-xs text-dark-400 mt-0.5">
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
                  <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-dark-300 hover:text-dark-50 transition-colors">
                    <BookOpen className="w-4 h-4" /> Resources <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'resources' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 w-64 bg-dark-800 rounded-2xl shadow-2xl shadow-black/40 border border-white/[0.06] p-2 mt-2"
                      >
                        {resourcesLinks.map((item) => (
                          <div key={item.label} className="block px-4 py-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors group/item">
                            <div className="text-sm font-semibold text-dark-50 group-hover/item:text-primary-400">
                              {item.label}
                            </div>
                            <div className="text-xs text-dark-400 mt-0.5">
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
                  <div className="text-sm font-bold text-dark-50">{user?.name}</div>
                  <div className="text-xs text-dark-400 font-medium capitalize">{user?.role}</div>
                </div>
                <Link to="/profile" className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 hover:scale-110 transition-transform cursor-pointer">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Link>
                <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout} className="text-dark-400 hover:text-red-400 hover:bg-red-500/10">

                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-dark-300 hover:text-dark-50 transition-colors px-4 py-2">
                  Sign In
                </Link>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/register')}
                  className="shadow-lg shadow-indigo-500/20"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-xl text-dark-300
                hover:bg-white/[0.04] transition-colors focus:ring-2 focus:ring-primary-500/20"
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
            className="md:hidden border-t border-white/[0.06] bg-dark-900 overflow-hidden shadow-2xl shadow-black/40"
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
                        ? 'text-primary-400 bg-primary-500/10'
                        : 'text-dark-300 hover:bg-white/[0.04]'
                      }`}
                  >
                    {link.icon && <link.icon className="w-5 h-5" />}
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/15 transition-colors"
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