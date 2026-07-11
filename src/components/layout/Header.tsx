import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sun,
  Moon,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogIn,
  LogOut,
  LayoutDashboard,
  Package,
} from 'lucide-react';
import clsx from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useUIStore } from '@/stores/uiStore';
import MobileMenu from './MobileMenu';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  {
    label: 'Categories',
    path: '/categories',
    hasDropdown: true,
    children: [
      { label: 'Electronics', path: '/categories/electronics' },
      { label: 'Clothing', path: '/categories/clothing' },
      { label: 'Home & Garden', path: '/categories/home-garden' },
      { label: 'Sports & Outdoors', path: '/categories/sports' },
      { label: 'Books & Media', path: '/categories/books' },
      { label: 'Beauty & Health', path: '/categories/beauty' },
    ],
  },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { mobileMenuOpen, openMobileMenu, searchOpen, toggleSearch } = useUIStore();

  const [scrolled, setScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categoriesTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();

  // Scroll detection for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close user dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setCategoriesOpen(false);
  }, [location.pathname]);

  const handleCategoriesEnter = () => {
    if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
    setCategoriesOpen(true);
  };

  const handleCategoriesLeave = () => {
    categoriesTimeoutRef.current = setTimeout(() => setCategoriesOpen(false), 150);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={clsx(
          'fixed left-0 right-0 top-0 z-40 border-b border-surface-200 transition-all duration-200 dark:border-surface-800',
          scrolled
            ? 'bg-white/95 shadow-sm backdrop-blur-xl dark:bg-surface-950/95'
            : 'bg-white dark:bg-surface-950'
        )}
      >
        {/* Search overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 border-b border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mx-auto flex max-w-2xl items-center gap-3">
                <Search className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, categories, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none dark:text-gray-100 dark:placeholder-gray-400"
                />
                <button
                  onClick={toggleSearch}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-surface-950 dark:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">J</span>
            <span>Joe's Shop</span>
          </Link>

          {/* Center: Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <div
                key={link.path}
                className="relative"
                onMouseEnter={link.hasDropdown ? handleCategoriesEnter : undefined}
                onMouseLeave={link.hasDropdown ? handleCategoriesLeave : undefined}
              >
                <Link
                  to={link.path}
                  className={clsx(
                    'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-surface-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-surface-900 dark:hover:text-blue-400'
                  )}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <ChevronDown
                      className={clsx(
                        'h-3.5 w-3.5 transition-transform',
                        categoriesOpen && 'rotate-180'
                      )}
                    />
                  )}
                </Link>

                {/* Categories Mega Menu Dropdown */}
                {link.hasDropdown && (
                  <AnimatePresence>
                    {categoriesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className={clsx(
                          'absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg border shadow-xl',
                          'border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900',
                          'w-[480px]'
                        )}
                      >
                        <div className="mb-4">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Browse Categories
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {link.children?.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={clsx(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
                                'dark:text-gray-300 dark:hover:bg-blue-950/30 dark:hover:text-blue-300'
                              )}
                            >
                              <Package className="h-4 w-4 text-gray-400" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                          <Link
                            to="/categories"
                            className={clsx(
                              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                              'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30'
                            )}
                          >
                            View All Categories
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search toggle */}
            <button
              onClick={toggleSearch}
              className={clsx(
                'rounded-lg p-2 transition-all',
                'text-gray-600 hover:bg-gray-100 hover:text-blue-600',
                'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400',
                searchOpen && 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
              )}
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={clsx(
                'hidden rounded-lg p-2 transition-all sm:inline-flex',
                'text-gray-600 hover:bg-gray-100 hover:text-blue-600',
                'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400'
              )}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={clsx(
                'relative hidden rounded-lg p-2 transition-all sm:inline-flex',
                'text-gray-600 hover:bg-gray-100 hover:text-blue-600',
                'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400'
              )}
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className={clsx(
                  'absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1',
                  'bg-blue-600 text-[10px] font-bold text-white'
                )}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className={clsx(
                'relative rounded-lg p-2 transition-all',
                'text-gray-600 hover:bg-gray-100 hover:text-blue-600',
                'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400'
              )}
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className={clsx(
                  'absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1',
                  'bg-blue-600 text-[10px] font-bold text-white'
                )}>
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User dropdown */}
            <div className="relative hidden sm:block" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={clsx(
                  'flex items-center gap-2 rounded-lg p-2 transition-all',
                  'text-gray-600 hover:bg-gray-100 hover:text-blue-600',
                  'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400'
                )}
                aria-label="User menu"
              >
                {user ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={clsx(
                      'absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border shadow-xl',
                      'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                    )}
                  >
                    {user ? (
                      <>
                        {/* User info header */}
                        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email || ''}
                          </p>
                        </div>
                        <div className="p-1.5">
                          <Link
                            to="/profile"
                            className={clsx(
                              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                              'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                            )}
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                          <Link
                            to="/dashboard"
                            className={clsx(
                              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                              'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                            )}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 p-1.5 dark:border-gray-800">
                          <button
                            onClick={() => {
                              signOut();
                              setUserDropdownOpen(false);
                            }}
                            className={clsx(
                              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                              'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
                            )}
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3">
                        <p className="mb-3 text-center text-xs text-gray-500 dark:text-gray-400">
                          Sign in to access your account
                        </p>
                        <Link
                          to="/login"
                          className={clsx(
                            'flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                            'border-gray-200 text-gray-700 hover:bg-gray-50',
                            'dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                          )}
                        >
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          className={clsx(
                            'mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all',
                            'bg-blue-600 hover:bg-blue-700'
                          )}
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={openMobileMenu}
              className={clsx(
                'rounded-lg p-2 transition-all lg:hidden',
                'text-gray-600 hover:bg-gray-100 hover:text-blue-600',
                'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400'
              )}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer to offset fixed header */}
      <div className="h-16" />

      {/* Mobile menu overlay */}
      <MobileMenu />
    </>
  );
}
