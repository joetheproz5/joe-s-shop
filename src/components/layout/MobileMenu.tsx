import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Home,
  ShoppingBag,
  Grid3X3,
  Info,
  Phone,
  Sun,
  Moon,
  User,
  LogIn,
  LogOut,
  LayoutDashboard,
  Heart,
} from 'lucide-react';
import clsx from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useUIStore } from '@/stores/uiStore';

const categories = [
  { label: 'Electronics', path: '/categories/electronics' },
  { label: 'Clothing', path: '/categories/clothing' },
  { label: 'Home & Garden', path: '/categories/home-garden' },
  { label: 'Sports', path: '/categories/sports' },
  { label: 'Books', path: '/categories/books' },
];

export default function MobileMenu() {
  const { mobileMenuOpen, closeMobileMenu } = useUIStore();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: ShoppingBag },
    { label: 'Categories', path: '/categories', icon: Grid3X3, hasSubmenu: true },
    { label: 'About', path: '/about', icon: Info },
    { label: 'Contact', path: '/contact', icon: Phone },
  ];

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          {/* Menu panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl dark:bg-gray-900"
          >
            <div className="flex h-full flex-col overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                  Joe's Shop
                </span>
                <button
                  onClick={closeMobileMenu}
                  className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6">
                <ul className="space-y-1">
                  {navLinks.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        onClick={closeMobileMenu}
                        className={clsx(
                          'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                          'text-gray-700 hover:bg-gray-50 hover:text-violet-600',
                          'dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-violet-400'
                        )}
                      >
                        <link.icon className="h-5 w-5 shrink-0" />
                        <span>{link.label}</span>
                        {link.hasSubmenu && (
                          <svg
                            className="ml-auto h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </Link>

                      {/* Category sublinks */}
                      {link.hasSubmenu && (
                        <ul className="ml-8 mt-1 space-y-1">
                          {categories.map((cat) => (
                            <li key={cat.path}>
                              <Link
                                to={cat.path}
                                onClick={closeMobileMenu}
                                className={clsx(
                                  'block rounded-lg px-4 py-2 text-sm transition-colors',
                                  'text-gray-500 hover:bg-gray-50 hover:text-violet-600',
                                  'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-violet-400'
                                )}
                              >
                                {cat.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Bottom actions */}
              <div className="border-t border-gray-100 px-6 py-6 dark:border-gray-800">
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                    'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-5 w-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                {/* Wishlist link */}
                <Link
                  to="/wishlist"
                  onClick={closeMobileMenu}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                    'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  <Heart className="h-5 w-5" />
                  <span>Wishlist</span>
                </Link>

                {/* Divider */}
                <div className="my-3 border-t border-gray-100 dark:border-gray-800" />

                {/* Auth section */}
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                        'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                      )}
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                        'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                      )}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        closeMobileMenu();
                      }}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                        'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
                      )}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className={clsx(
                        'flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium transition-all',
                        'text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                      )}
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
                    >
                      <User className="h-4 w-4" />
                      <span>Create Account</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
