import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, Twitter, Youtube } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { SITE_NAME } from '@/lib/constants'
import { BrandLogo } from './BrandLogo'

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', path: '/shop' },
      { label: 'New arrivals', path: '/shop?is_new_arrival=true' },
      { label: 'Best sellers', path: '/shop?is_best_seller=true' },
      { label: 'Categories', path: '/categories' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My profile', path: '/account' },
      { label: 'Orders', path: '/account/orders' },
      { label: 'Wishlist', path: '/account/wishlist' },
      { label: 'Addresses', path: '/account/addresses' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact us', path: '/contact' },
      { label: 'Shipping and delivery', path: '/shipping-policy' },
      { label: 'Returns', path: '/returns' },
      { label: 'Privacy', path: '/privacy' },
    ],
  },
]

const socials = [
  { label: 'Instagram', icon: Instagram, href: '#' },
  { label: 'Facebook', icon: Facebook, href: '#' },
  { label: 'X', icon: Twitter, href: '#' },
  { label: 'YouTube', icon: Youtube, href: '#' },
]

export default function Footer() {
  const { isStaff } = useAuth()

  return (
    <footer className="border-t border-[#dde1e6] bg-[#f5f7f9] text-[#30343b] dark:border-surface-800 dark:bg-surface-950 dark:text-surface-200">
      <div className="section-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.8fr]">
        <div className="max-w-sm">
          <Link to="/" className="inline-flex" aria-label={`${SITE_NAME} home`}>
            <BrandLogo className="w-[132px]" />
          </Link>
          <p className="mt-4 text-sm leading-6 text-[#626a73] dark:text-surface-400">
            Straightforward shopping for phones, laptops, audio, wearables, and accessories in Lebanon.
          </p>
          <a href="mailto:hello@thetechshelf.com" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#0b57d0] hover:text-[#0842a0] dark:text-blue-400">
            <Mail size={16} /> hello@thetechshelf.com
          </a>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-[#202124] dark:text-white">{column.title}</h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-[#626a73] transition-colors hover:text-[#0b57d0] dark:text-surface-400 dark:hover:text-blue-400">
                    {link.label}
                  </Link>
                </li>
              ))}
              {column.title === 'Account' && isStaff && (
                <li>
                  <Link to="/admin" className="text-sm text-[#626a73] transition-colors hover:text-[#0b57d0] dark:text-surface-400 dark:hover:text-blue-400">
                    Staff dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[#dde1e6] dark:border-surface-800">
        <div className="section-container flex flex-col gap-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#717780] dark:text-surface-500">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#626a73] transition-colors hover:bg-white hover:text-[#0b57d0] dark:text-surface-400 dark:hover:bg-surface-900 dark:hover:text-blue-400"
              >
                <social.icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
