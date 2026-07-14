import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, type UserRole } from '../app/providers';
import {
  LayoutDashboard,
  Radio,
  Users,
  Map,
  MessageSquare,
  Upload,
  AlertTriangle,
  Accessibility,
  Leaf,
  FileText,
  Settings,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Bell,
  ChevronDown,
  User,
  Shield,
  Activity,
  Menu,
  X
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const {
    role,
    setRole,
    theme,
    toggleTheme,
    isConnected,
    notifications,
    clearNotifications
  } = useApp();
  
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Overview', path: '/dashboard/overview', icon: LayoutDashboard },
    { name: 'Operations Center', path: '/dashboard/operations', icon: Radio },
    { name: 'Crowd Intelligence', path: '/dashboard/crowd', icon: Users },
    { name: 'Navigation Center', path: '/dashboard/navigation', icon: Map },
    { name: 'AI Assistant', path: '/dashboard/ai-assistant', icon: MessageSquare },
    { name: 'Upload Center', path: '/dashboard/upload-center', icon: Upload },
    { name: 'Emergency Center', path: '/dashboard/emergency', icon: AlertTriangle, badge: 'Alerts' },
    { name: 'Accessibility Center', path: '/dashboard/accessibility', icon: Accessibility },
    { name: 'Sustainability', path: '/dashboard/sustainability', icon: Leaf },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const getRoleIcon = (currentRole: UserRole) => {
    switch (currentRole) {
      case 'Security':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'Operations':
        return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'Volunteer':
        return <User className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-slate-500" />;
    }
  };

  const currentPathName = navigationItems.find(item => item.path === location.pathname)?.name || 'Stadium Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-graphite-950">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white/70 dark:bg-graphite-900/60 backdrop-blur-md border-r border-gray-150/40 dark:border-graphite-800/40">
        
        {/* LOGO AREA */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150/40 dark:border-graphite-800/40">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-graphite-950 border border-gray-150/50 dark:border-graphite-850 flex items-center justify-center p-1.5 shrink-0 shadow-sm">
              <img src="/logos/logo.png" alt="VenueOS AI Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-tight text-forest-500 dark:text-forest-400 uppercase">VenueOS AI</h1>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">World Cup 2026</p>
            </div>
          </Link>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.path}
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold rounded-full transition-all duration-200 border-l-3 ${
                      isActive
                        ? 'bg-gradient-to-r from-forest-500/90 to-forest-650/90 text-white shadow-premium border-emerald-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-graphite-800/55 border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3.5">
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[9.5px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-full border border-amber-500/20 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* STAKEHOLDER SELECTOR FOOTER */}
        <div className="p-4 border-t border-gray-150/40 dark:border-graphite-800/40 bg-gray-50/30 dark:bg-graphite-900/30">
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center justify-between w-full px-4 py-2.5 bg-white/70 dark:bg-graphite-900/70 border border-gray-200 dark:border-graphite-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-graphite-850 shadow-premium"
            >
              <div className="flex items-center space-x-2.5">
                {getRoleIcon(role)}
                <span>Role: {role}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-450" />
            </button>
            {isRoleDropdownOpen && (
              <div className="absolute bottom-full left-0 w-full mb-1.5 bg-white dark:bg-graphite-900 border border-gray-200 dark:border-graphite-800 rounded-xl shadow-lg z-50 overflow-hidden">
                {(['Fan', 'Operations', 'Security', 'Volunteer'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`flex items-center space-x-2.5 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-graphite-800 ${
                      role === r ? 'font-black bg-gray-50 dark:bg-graphite-850 text-forest-500 dark:text-forest-400' : 'text-gray-600 dark:text-gray-400 font-semibold'
                    }`}
                  >
                    {getRoleIcon(r)}
                    <span>{r} View</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER MENU */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* FLOATING DETACHED GLASSMORPHIC ROUND NAVIGATION BAR */}
        <header className="mx-4 md:mx-8 mt-4 mb-2 bg-white/70 dark:bg-graphite-900/60 backdrop-blur-md border border-gray-150/40 dark:border-graphite-800/40 rounded-full shadow-premium flex items-center justify-between h-14 px-5 md:px-6 shrink-0 z-40">
          
          {/* HEADER TITLE & MENU BTN */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-graphite-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* MINI ROUND LOGO BADGE IN TOP NAV BAR */}
            <div className="w-8 h-8 rounded-full bg-white dark:bg-graphite-955 border border-gray-150/50 dark:border-graphite-850 flex items-center justify-center p-1 shadow-sm shrink-0">
              <img src="/logos/logo.png" alt="VenueOS AI Logo" className="w-full h-full object-contain" />
            </div>

            <h2 className="text-sm font-bold text-gray-850 dark:text-white tracking-tight">
              {currentPathName}
            </h2>
          </div>

          {/* RIGHT UTILITIES PANEL */}
          <div className="flex items-center space-x-3.5">
            
            {/* CONNECTION STATUS TOAST */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'
                : 'bg-red-500/10 text-red-500 animate-pulse'
            }`}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{isConnected ? 'Live Sync Active' : 'Disconnected'}</span>
            </div>

            {/* LIGHT/DARK TOGGLE */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-graphite-800 transition-colors"
              title="Toggle design mode"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {/* LIVE NOTIFICATIONS ALERTS DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-graphite-800 transition-colors"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-graphite-900"></span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-graphite-900/95 backdrop-blur-md border border-gray-200 dark:border-graphite-800 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-150 dark:border-graphite-800 bg-gray-50/55 dark:bg-graphite-850/55">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Live Feeds Log</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-forest-500 dark:text-forest-400 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-xs text-gray-400 dark:text-gray-500 font-semibold">
                        No telemetry logs available.
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2.5 border-b border-gray-100 dark:border-graphite-850 text-xs text-gray-600 dark:text-gray-450 hover:bg-gray-50/50 dark:hover:bg-graphite-850/50 font-semibold"
                        >
                          {n}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* USER AVATAR / PROFILE */}
            <div className="flex items-center space-x-2 border-l border-gray-200/50 dark:border-graphite-800/50 pl-3">
              <div className="w-8 h-8 rounded-full bg-forest-500/10 text-forest-500 dark:text-forest-400 flex items-center justify-center font-bold text-xs shrink-0 border border-forest-500/10">
                OP
              </div>
              <span className="text-xs font-bold text-gray-750 dark:text-gray-200 hidden lg:block">Shifty Director</span>
            </div>

          </div>
        </header>

        {/* MAIN BODY OUTLET CONTAINER WITH TRANSITIONS */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-2 md:pt-4 bg-gray-50 dark:bg-graphite-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="max-w-7xl mx-auto space-y-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MOBILE COMPACT SIDEBAR MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex flex-col w-64 bg-white/95 dark:bg-graphite-900/95 backdrop-blur-md border-r border-gray-200/40 dark:border-graphite-800/45">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-200 dark:border-graphite-800">
              <span className="text-sm font-bold text-forest-500 dark:text-forest-400">VenueOS Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-graphite-800 rounded-lg">
                <X className="w-5.5 h-5.5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-full ${
                        isActive
                          ? 'bg-forest-500 text-white shadow-premium'
                          : 'text-gray-650 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-graphite-800'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3.5">
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}

    </div>
  );
};
export default DashboardLayout;
