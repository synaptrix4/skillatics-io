import { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, Search, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, logout } from '../lib/auth';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DashboardNavbar() {
    const user = getCurrentUser();
    const navigate = useNavigate();
    const firstName = user?.name ? user.name.split(' ')[0] : 'User';

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = () => {
        toast('Search functionality coming soon!', { icon: '🔍' });
    };

    const handleNotifications = () => {
        toast('You have 0 new notifications.', { icon: '🔔' });
    };

    const profilePath = user?.role === 'Admin' ? '/admin/profile'
        : user?.role === 'Faculty' ? '/faculty/profile'
            : user?.role === 'TPO' ? '/faculty/profile'
                : '/student/profile';

    return (
        <div className="sticky top-0 z-40 pt-6 px-4 sm:px-8 pb-4 mb-2 bg-slate-50/80 backdrop-blur-md hidden md:block">
            <div className="flex items-center justify-between rounded-full bg-white/80 border border-slate-200/60 shadow-sm backdrop-blur-2xl px-6 py-3 transition-shadow duration-300 hover:shadow-md">
                {/* Left: Greeting */}
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                        Hello, {firstName} <motion.span
                            className="inline-block text-xl origin-bottom-right"
                            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5 }}
                        >👋</motion.span>
                    </h1>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 text-slate-500" ref={dropdownRef}>
                    <motion.button
                        onClick={handleSearch}
                        whileHover={{ scale: 1.05, backgroundColor: "rgb(241 245 249)" }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1.5 rounded-full transition-colors hidden sm:block text-slate-600 hover:text-slate-900"
                    >
                        <Search className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgb(241 245 249)" }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1.5 rounded-full transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <HelpCircle className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                        onClick={handleNotifications}
                        whileHover={{ scale: 1.05, backgroundColor: "rgb(241 245 249)" }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1.5 rounded-full transition-colors relative text-slate-600 hover:text-slate-900"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-orange-500 border-2 border-white shadow-sm"></span>
                    </motion.button>

                    {/* User Profile */}
                    <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                    <div className="relative">
                        <motion.button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 pl-2 transition-opacity hover:opacity-80"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold shadow-md shadow-orange-500/20">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </motion.button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-3 w-48 rounded-xl bg-white border border-slate-200/60 shadow-xl overflow-hidden z-50 py-1"
                                >
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                        <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                                    </div>
                                    <Link
                                        to={profilePath}
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                                    >
                                        <User className="h-4 w-4" />
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            {/* Optional subtext directly beneath navbar for context, as per Remote reference */}
            <p className="px-6 mt-3 text-sm font-medium text-slate-500">
                Here's what's going on today.
            </p>
        </div>
    );
}
