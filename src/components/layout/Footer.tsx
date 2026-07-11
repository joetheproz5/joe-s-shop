import { Link } from 'react-router-dom'
import { Instagram, Mail, MapPin } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const columns = [
  { title: 'Shop', links: [
    ['All products', '/shop'], ['New arrivals', '/shop?is_new_arrival=true'], ['Best sellers', '/shop?is_best_seller=true'], ['Featured', '/shop?is_featured=true'],
  ] },
  { title: 'Support', links: [
    ['My account', '/account'], ['Orders', '/account/orders'], ['Contact', '/contact'], ['Returns', '/contact'],
  ] },
  { title: 'Joe’s', links: [
    ['Our story', '/about'], ['Privacy', '/privacy'], ['Terms', '/terms'],
  ] },
]

export default function Footer() {
  const { isStaff } = useAuth()

  return (
    <footer className="border-t border-surface-200 bg-[#f7f7f5] dark:border-surface-800 dark:bg-[#111]">
      <div className="section-container py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-[-.03em]"><span className="grid h-9 w-9 place-items-center rounded-full bg-surface-950 text-xs text-white dark:bg-white dark:text-surface-950">J</span>Joe's</Link>
            <p className="mt-5 text-sm leading-6 text-surface-500 dark:text-surface-400">Thoughtfully selected products for modern life. Clear choices, honest value, and support that feels human.</p>
            <div className="mt-6 flex gap-2">
              <a href="mailto:hello@joesshop.com" aria-label="Email" className="grid h-10 w-10 place-items-center rounded-full border border-surface-300 hover:bg-white dark:border-surface-700 dark:hover:bg-surface-900"><Mail size={17} /></a>
              <a href="#" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-surface-300 hover:bg-white dark:border-surface-700 dark:hover:bg-surface-900"><Instagram size={17} /></a>
              <span className="flex h-10 items-center gap-2 rounded-full border border-surface-300 px-4 text-xs text-surface-500 dark:border-surface-700"><MapPin size={14} /> New York</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => <div key={column.title}><h3 className="text-xs font-semibold uppercase tracking-[.16em] text-surface-400">{column.title}</h3><ul className="mt-5 space-y-3.5">{column.links.map(([label, path]) => <li key={label}><Link to={path} className="text-sm text-surface-600 transition-colors hover:text-surface-950 dark:text-surface-400 dark:hover:text-white">{label}</Link></li>)}{column.title === 'Joe’s' && isStaff && <li><Link to="/admin" className="text-sm text-surface-600 transition-colors hover:text-surface-950 dark:text-surface-400 dark:hover:text-white">Staff dashboard</Link></li>}</ul></div>)}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-surface-200 pt-7 text-xs text-surface-400 sm:flex-row sm:items-center sm:justify-between dark:border-surface-800">
          <p>© {new Date().getFullYear()} Joe's Shop. All rights reserved.</p>
          <p>Secure checkout · Visa · Mastercard · PayPal · Apple Pay</p>
        </div>
      </div>
    </footer>
  )
}
