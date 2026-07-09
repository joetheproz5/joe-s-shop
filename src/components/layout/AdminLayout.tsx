import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  Tag,
  ShoppingBag,
  Users,
  Ticket,
  Star,
  BarChart3,
  Warehouse,
  FolderOpen,
  Settings,
  Shield,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  User,
  LogOut,
  Home,
  ChevronLeft,
} from 'lucide-react';
import clsx from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/context/AuthContext';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';

interface SidebarSection {
  title: string;
  items: {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Products', path: '/admin/products', icon: Package },
      { label: 'Categories', path: '/admin/categories', icon: Grid3X3 },
      { label: 'Brands', path: '/admin/brands', icon: Tag },
      { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
      { label: 'Customers', path: '/admin/customers', icon: Users },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
      { label: 'Reviews', path: '/admin/reviews', icon: Star },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      { label: 'Inventory', path: '/admin/inventory', icon: Warehouse },
      { label: 'File Manager', path: '/admin/media', icon: FolderOpen },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  },
  {
    title: 'Access',
    items: [
      { label: 'Roles', path: '/admin/roles', icon: Shield },
    ],
  },
];

function getBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Skip 'admin' prefix for display, but include it
  if (segments[0] === 'admin') {
    if (segments.length === 1 || segments[1] === 'dashboard') {
      return [{ label: 'Dashboard' }];
    }
    segments.slice(1).forEach((segment) => {
      items.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      });
    });
  }

  return items;
}

export default function AdminLayout() {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapse } = useUIStore();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    return location.pathname.startsWith(path);
  };

  // Close sidebar overlay on mobile when route changes
  useEffect(() => {
    if (sidebarOpen) {
      toggleSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        toggleSidebar();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, toggleSidebar]);

  const breadcrumbs = getBreadcrumbsFromPath(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900',
          // Mobile: overlay style
          'lg:static lg:z-auto',
          // Open/closed state
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
          'w-64'
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4 dark:border-gray-800">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <Link to="/" className="text-lg font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                    Joe's
                  </span>
                  <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                    {' '}Admin
                  </span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {(sidebarCollapsed || !sidebarOpen) && (
            <Link
              to="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 text-xs font-bold text-white"
            >
              J
            </Link>
          )}

          {/* Collapse toggle - desktop only */}
          <button
            onClick={toggleSidebarCollapse}
            className={clsx(
              'hidden rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300',
              'lg:flex',
              sidebarCollapsed && 'hidden'
            )}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Close button - mobile only */}
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-6">
              {!sidebarCollapsed && (
                <h4 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {section.title}
                </h4>
              )}

              {/* Collapsed separator line */}
              {sidebarCollapsed && (
                <div className="mx-auto mb-2 h-px w-8 bg-gray-200 dark:bg-gray-700" />
              )}

              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={clsx(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 shadow-sm dark:from-violet-950/50 dark:to-fuchsia-950/50 dark:text-violet-300'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
                        sidebarCollapsed && 'justify-center px-0'
                      )}
                    >
                      <item.icon
                        className={clsx(
                          'h-5 w-5 flex-shrink-0 transition-colors',
                          isActive(item.path)
                            ? 'text-violet-600 dark:text-violet-400'
                            : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
                        )}
                      />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        {sidebarCollapsed ? (
          <div className="border-t border-gray-100 p-3 dark:border-gray-800">
            <Link
              to="/"
              title="Back to Store"
              className="flex items-center justify-center rounded-xl px-3 py-2.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-violet-600 dark:hover:bg-gray-800 dark:hover:text-violet-400"
            >
              <Home className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="border-t border-gray-100 p-3 dark:border-gray-800">
            <Link
              to="/"
              className={clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                'text-gray-500 hover:bg-gray-50 hover:text-violet-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-violet-400'
              )}
            >
              <Home className="h-5 w-5" />
              <span>Back to Store</span>
            </Link>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin top header bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle - mobile */}
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Sidebar expand toggle - desktop (when collapsed) */}
            {sidebarCollapsed && (
              <button
                onClick={toggleSidebarCollapse}
                className="hidden rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 lg:block"
                aria-label="Expand sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Breadcrumbs */}
            <div className="hidden sm:block">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:block">
              <div className={clsx(
                'flex items-center gap-2 rounded-lg border px-3 py-2',
                'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              )}>
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-48 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none dark:text-gray-300 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Mobile search button */}
            <button
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button
              className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-violet-500" />
            </button>

            {/* User avatar dropdown */}
            <div className="relative ml-1">
              <button
                className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="User menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 lg:block">
                  {user?.name || 'Admin'}
                </span>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={signOut}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
