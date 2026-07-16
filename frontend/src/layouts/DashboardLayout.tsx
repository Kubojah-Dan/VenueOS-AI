import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
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
  X,
  LogOut,
  ChevronLeft,
  Zap,
} from 'lucide-react';

const getTranslationKey = (name: string): string => {
  const map: Record<string, string> = {
    'Overview': 'overview',
    'Operations Center': 'operations',
    'Crowd Intelligence': 'crowd',
    'Navigation Center': 'navigation',
    'AI Assistant': 'assistant',
    'Upload Center': 'upload',
    'Emergency Center': 'emergency',
    'Accessibility Center': 'accessibility',
    'Sustainability': 'sustainability',
    'Reports': 'reports',
    'Settings': 'settings'
  };
  return map[name] || name;
};

export const DashboardLayout: React.FC = () => {
  const {
    role,
    setRole,
    theme,
    toggleTheme,
    isConnected,
    notifications,
    clearNotifications,
    t
  } = useApp();
  
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsRoleDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setIsNotificationsOpen(false);
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getRoleAllowedPaths = (currentRole: UserRole) => {
    switch (currentRole) {
      case 'Operations':
        return [
          '/dashboard/overview',
          '/dashboard/operations',
          '/dashboard/crowd',
          '/dashboard/navigation',
          '/dashboard/ai-assistant',
          '/dashboard/upload-center',
          '/dashboard/emergency',
          '/dashboard/accessibility',
          '/dashboard/sustainability',
          '/dashboard/reports',
          '/dashboard/settings'
        ];
      case 'Security':
        return [
          '/dashboard/overview',
          '/dashboard/operations',
          '/dashboard/crowd',
          '/dashboard/navigation',
          '/dashboard/ai-assistant',
          '/dashboard/emergency'
        ];
      case 'Volunteer':
        return [
          '/dashboard/overview',
          '/dashboard/navigation',
          '/dashboard/ai-assistant',
          '/dashboard/accessibility',
          '/dashboard/sustainability'
        ];
      case 'Fan':
      default:
        return [
          '/dashboard/overview',
          '/dashboard/navigation',
          '/dashboard/accessibility',
          '/dashboard/sustainability'
        ];
    }
  };

  const handleSignOut = () => {
    setRole('Fan');
    navigate('/login');
  };

  React.useEffect(() => {
    const allowed = getRoleAllowedPaths(role);
    if (!allowed.includes(location.pathname)) {
      navigate('/dashboard/overview');
    }
  }, [role, location.pathname, navigate]);

  const navigationItems = [
    { name: 'Overview',           path: '/dashboard/overview',        icon: LayoutDashboard },
    { name: 'Operations Center',  path: '/dashboard/operations',       icon: Radio },
    { name: 'Crowd Intelligence', path: '/dashboard/crowd',            icon: Users },
    { name: 'Navigation Center',  path: '/dashboard/navigation',       icon: Map },
    { name: 'AI Assistant',       path: '/dashboard/ai-assistant',     icon: MessageSquare },
    { name: 'Upload Center',      path: '/dashboard/upload-center',    icon: Upload },
    { name: 'Emergency Center',   path: '/dashboard/emergency',        icon: AlertTriangle, badge: 'Alerts' },
    { name: 'Accessibility Center', path: '/dashboard/accessibility',  icon: Accessibility },
    { name: 'Sustainability',     path: '/dashboard/sustainability',   icon: Leaf },
    { name: 'Reports',            path: '/dashboard/reports',          icon: FileText },
    { name: 'Settings',           path: '/dashboard/settings',         icon: Settings },
  ];

  const allowedPaths = getRoleAllowedPaths(role);
  const filteredNavigationItems = navigationItems.filter(item => allowedPaths.includes(item.path));

  const getRoleIcon = (currentRole: UserRole) => {
    switch (currentRole) {
      case 'Security':    return <Shield   className="w-4 h-4 text-red-400" />;
      case 'Operations':  return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'Volunteer':   return <User     className="w-4 h-4 text-blue-400" />;
      default:            return <Users    className="w-4 h-4 text-sand-500" />;
    }
  };

  const getRoleColor = (currentRole: UserRole) => {
    switch (currentRole) {
      case 'Security':    return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Operations':  return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Volunteer':   return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default:            return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  const currentItem = navigationItems.find(item => item.path === location.pathname);
  const currentPathName = currentItem ? t(getTranslationKey(currentItem.name)) : 'Dashboard';

  // ── Sidebar nav item renderer ──────────────────────────────────────
  const SidebarNavItem = ({ item, collapsed }: { item: typeof navigationItems[0], collapsed?: boolean }) => {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.path}
        title={collapsed ? item.name : undefined}
        className={({ isActive }) =>
          `group flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
            isActive
              ? 'bg-forest-500 text-white shadow-glow-green'
              : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--border-default)] hover:text-[color:var(--text-primary)]'
          }`
        }
      >
        <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
          <Icon className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="truncate">{t(getTranslationKey(item.name))}</span>}
        </div>
        {!collapsed && item.badge && (
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-500/15 text-amber-500 rounded-full border border-amber-500/25 uppercase tracking-wider">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Foggy Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.04] dark:opacity-[0.06] z-0 filter blur-[2px]"
        style={{ backgroundImage: "url('/stadium_bg.png'), url('/stadium_bg.jpg'), url('/stadium.jpg')" }}
      />

      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex md:flex-col shrink-0 my-3 ml-3 rounded-2xl border transition-all duration-300 relative z-10 ${
          isSidebarCollapsed ? 'md:w-[64px]' : 'md:w-60'
        }`}
        style={{
          background: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
          backdropFilter: 'blur(16px)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Logo */}
        <div className={`flex items-center border-b py-4 ${isSidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'}`}
          style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="w-8 h-8 rounded-full border flex items-center justify-center p-1 shrink-0"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <img src="/logos/logo.png" alt="VenueOS AI" className="w-full h-full object-contain animate-spin-slow" />
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <span className="text-xs font-black tracking-tight text-forest-500 dark:text-emerald-400 block leading-none uppercase truncate">VenueOS AI</span>
              <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>World Cup 2026</span>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className={`flex-1 py-3 space-y-0.5 overflow-y-auto ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
          {filteredNavigationItems.map((item) => (
            <SidebarNavItem key={item.path} item={item} collapsed={isSidebarCollapsed} />
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className={`p-3 border-t`} style={{ borderColor: 'var(--sidebar-border)' }}>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`flex items-center justify-center w-full py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[color:var(--border-default)]`}
            style={{ color: 'var(--text-muted)' }}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            {!isSidebarCollapsed && <span className="ml-2 truncate">Collapse</span>}
          </button>
        </div>

        {/* Role Switcher */}
        {!isSidebarCollapsed && (
          <div className="px-3 pb-3" data-dropdown>
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${getRoleColor(role)}`}
            >
              <div className="flex items-center space-x-2">
                {getRoleIcon(role)}
                <span>{role} View</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isRoleDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-[72px] left-3 right-3 rounded-xl border shadow-premium-lg overflow-hidden z-50"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                >
                  {(['Fan', 'Operations', 'Security', 'Volunteer'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRole(r); setIsRoleDropdownOpen(false); }}
                      className={`flex items-center space-x-2.5 w-full px-4 py-2.5 text-xs text-left transition-all ${
                        role === r
                          ? 'font-black text-forest-500 dark:text-emerald-400'
                          : 'font-semibold'
                      }`}
                      style={{
                        color: role === r ? undefined : 'var(--text-secondary)',
                        background: role === r ? 'var(--accent-glow)' : undefined,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-default)')}
                      onMouseLeave={e => (e.currentTarget.style.background = role === r ? 'var(--accent-glow)' : 'transparent')}
                    >
                      {getRoleIcon(r)}
                      <span>{r} View</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT AREA ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden relative z-10 min-w-0">

        {/* ── TOP NAV BAR ──────────────────────────────────────────────── */}
        <header
          className="mx-3 mt-3 mb-2 rounded-2xl border flex items-center justify-between h-13 px-3 sm:px-4 shrink-0 z-40"
          style={{
            background: 'var(--sidebar-bg)',
            borderColor: 'var(--sidebar-border)',
            backdropFilter: 'blur(16px)',
            boxShadow: 'var(--shadow-card)',
            minHeight: '52px',
          }}
        >
          {/* Left: Hamburger + Logo + Title */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg transition-colors shrink-0"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-default)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-7 h-7 rounded-full border flex items-center justify-center p-1 shrink-0 md:hidden"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <img src="/logos/logo.png" alt="VenueOS AI" className="w-full h-full object-contain" />
            </div>

            <div className="flex items-center space-x-2 min-w-0">
              <h2 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {currentPathName}
              </h2>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-forest-500/10 text-forest-500 dark:text-emerald-400 border border-forest-500/15 shrink-0">
                <Zap className="w-2.5 h-2.5" />
                <span>FIFA WC26</span>
              </span>
            </div>
          </div>

          {/* Right: Utilities */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* Connection Status */}
            <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-full text-xs font-bold transition-all border ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'
            }`}>
              {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-default)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              title="Toggle theme"
              aria-label="Toggle visual theme mode"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-default)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                aria-label="View live alerts notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border border-[color:var(--bg-card)]" />
                )}
              </button>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border shadow-premium-lg z-50 overflow-hidden"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b"
                      style={{ borderColor: 'var(--border-default)', background: 'var(--bg-panel)' }}>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Live Feed Log</span>
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-xs font-bold text-forest-500 dark:text-emerald-400 hover:underline">
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-5 text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                          No telemetry logs available.
                        </div>
                      ) : (
                        notifications.map((n, idx) => (
                          <div key={idx} className="px-4 py-2.5 border-b text-xs font-medium" 
                            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                            {n}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Role Avatar + Sign Out */}
            <div className="flex items-center space-x-1.5 pl-1.5 border-l" style={{ borderColor: 'var(--border-default)' }}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${getRoleColor(role)}`}
                title={`Active Role: ${role}`}
              >
                {role.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[10px] font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{role} Director</span>
                <span className="text-[8px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>Active Role</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg transition-colors text-red-400 hover:text-red-500"
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-default)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                title="Sign Out"
                aria-label="Sign out of operators console"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.20, ease: 'easeOut' }}
              className="max-w-7xl mx-auto space-y-4 sm:space-y-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── MOBILE DRAWER ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-72 flex flex-col md:hidden border-r"
              style={{
                background: 'var(--sidebar-bg)',
                backdropFilter: 'blur(20px)',
                borderColor: 'var(--sidebar-border)',
              }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center p-1"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                    <img src="/logos/logo.png" alt="VenueOS AI" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-forest-500 dark:text-emerald-400 block">VenueOS AI</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>World Cup 2026</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-default)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Role badge in drawer */}
              <div className="px-4 pt-3 pb-1">
                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${getRoleColor(role)}`}>
                  {getRoleIcon(role)}
                  <span>{role} View</span>
                </span>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-4 py-3 space-y-0.5 overflow-y-auto">
                {filteredNavigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-forest-500 text-white shadow-glow-green'
                            : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: isActive ? undefined : 'var(--text-secondary)',
                        background: undefined,
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5 shrink-0" />
                            <span>{t(getTranslationKey(item.name))}</span>
                          </div>
                          {item.badge && !isActive && (
                            <span className="text-[9px] font-bold bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded-full border border-amber-500/25 uppercase">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Drawer footer */}
              <div className="px-4 pb-5 pt-3 border-t space-y-2" style={{ borderColor: 'var(--border-default)' }}>
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-default)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 transition-all"
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
export default DashboardLayout;
