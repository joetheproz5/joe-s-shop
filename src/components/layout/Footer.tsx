import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
} from 'lucide-react';
import clsx from '@/lib/utils';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'Categories', path: '/categories' },
  { label: 'New Arrivals', path: '/shop?filter=new' },
  { label: 'Best Sellers', path: '/shop?filter=best-sellers' },
  { label: 'Deals & Offers', path: '/shop?filter=deals' },
];

const customerService = [
  { label: 'My Account', path: '/profile' },
  { label: 'Order Tracking', path: '/orders' },
  { label: 'Shipping Policy', path: '/shipping-policy' },
  { label: 'Returns & Exchanges', path: '/returns' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Size Guide', path: '/size-guide' },
];

const socialLinks = [
  { label: 'Facebook', icon: Facebook, href: '#' },
  { label: 'Twitter', icon: Twitter, href: '#' },
  { label: 'Instagram', icon: Instagram, href: '#' },
  { label: 'YouTube', icon: Youtube, href: '#' },
];

const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'Apple Pay', 'Google Pay', 'Stripe'];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Column 1: Company info */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <Link to="/" className="inline-block text-xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                Joe's
              </span>
              <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                {' '}Shop
              </span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Premium products curated with care. We bring you the finest selection with
              exceptional quality, fast shipping, and world-class customer service.
            </p>

            {/* Contact info */}
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 flex-shrink-0 text-violet-500" />
                <span>123 Commerce Street, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 flex-shrink-0 text-violet-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 flex-shrink-0 text-violet-500" />
                <span>hello@joesshop.com</span>
              </li>
            </ul>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={clsx(
                    'flex h-9 w-9 items-center justify-center rounded-full transition-all',
                    'text-gray-500 hover:bg-violet-100 hover:text-violet-600',
                    'dark:text-gray-400 dark:hover:bg-violet-950/30 dark:hover:text-violet-400'
                  )}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={clsx(
                      'text-sm transition-colors',
                      'text-gray-600 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Customer Service
            </h3>
            <ul className="mt-4 space-y-3">
              {customerService.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={clsx(
                      'text-sm transition-colors',
                      'text-gray-600 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Stay Updated
            </h3>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Subscribe to our newsletter for exclusive deals, new arrivals, and insider tips.
            </p>
            <form className="mt-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className={clsx(
                    'w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-all',
                    'border-gray-200 bg-white placeholder-gray-400',
                    'focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
                    'dark:border-gray-700 dark:bg-gray-900 dark:placeholder-gray-500',
                    'dark:focus:border-violet-400 dark:focus:ring-violet-400/20'
                  )}
                />
                <button
                  type="submit"
                  className={clsx(
                    'flex shrink-0 items-center justify-center rounded-lg px-4 py-2.5 transition-all',
                    'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:opacity-90'
                  )}
                  aria-label="Subscribe"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                By subscribing, you agree to our Privacy Policy.
              </p>
            </form>

            {/* Trust badges */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Free shipping on orders over $50
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                30-day money-back guarantee
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                24/7 customer support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          {/* Copyright */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Joe's Shop. All rights reserved.
          </p>

          {/* Payment methods */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className={clsx(
                  'rounded-md border px-2.5 py-1 text-xs font-medium',
                  'border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400'
                )}
              >
                {method}
              </span>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-4">
            <Link
              to="/privacy"
              className="text-sm text-gray-500 transition-colors hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-500 transition-colors hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
