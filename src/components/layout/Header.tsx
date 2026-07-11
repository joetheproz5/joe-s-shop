import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, LayoutDashboard, LogOut, Menu, Moon, Search, ShoppingBag, Sun, User, X } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useUIStore } from '@/stores/uiStore'
import { clsx } from '@/lib/utils'

const links = [
  { label: 'Shop', path: '/shop' },
  { label: 'New', path: '/shop?is_new_arrival=true' },
  { label: 'Best sellers', path: '/shop?is_best_seller=true' },
  { label: 'About', path: '/about' },
]

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const itemCount = useCartStore((state) => state.getItemCount())
  const wishlistCount = useWishlistStore((state) => state.items.length)
  const { openMobileMenu, searchOpen, toggleSearch } = useUIStore()
  const [query, setQuery] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => setAccountOpen(false), [location.pathname])
  useEffect(() => {
    const close = (event: MouseEvent) => { if (accountRef.current && !accountRef.current.contains(event.target as Node)) setAccountOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const value = query.trim()
    if (!value) return
    navigate(`/shop?search=${encodeURIComponent(value)}`)
    toggleSearch()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200/80 bg-white/88 backdrop-blur-2xl dark:border-surface-800 dark:bg-surface-950/88">
      <div className="section-container flex h-[68px] items-center justify-between gap-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 text-[1.05rem] font-semibold tracking-[-.03em] text-surface-950 dark:text-white" aria-label="Joe's Shop home">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-950 text-xs font-semibold text-white dark:bg-white dark:text-surface-950">J</span>
          <span>Joe's</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => <Link key={link.label} to={link.path} className={clsx('text-sm font-medium transition-colors hover:text-surface-950 dark:hover:text-white', location.pathname === link.path ? 'text-surface-950 dark:text-white' : 'text-surface-500 dark:text-surface-400')}>{link.label}</Link>)}
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <HeaderButton onClick={toggleSearch} label="Search"><Search size={19} strokeWidth={1.8} /></HeaderButton>
          <HeaderButton onClick={toggleTheme} label="Toggle theme" className="hidden sm:grid">{theme === 'dark' ? <Sun size={19} strokeWidth={1.8} /> : <Moon size={19} strokeWidth={1.8} />}</HeaderButton>
          <Link to="/account/wishlist" className="relative hidden h-10 w-10 place-items-center rounded-full text-surface-700 transition-colors hover:bg-surface-100 sm:grid dark:text-surface-300 dark:hover:bg-surface-900" aria-label="Wishlist"><Heart size={19} strokeWidth={1.8} />{wishlistCount > 0 && <Count value={wishlistCount} />}</Link>
          <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-900" aria-label="Cart"><ShoppingBag size={19} strokeWidth={1.8} />{itemCount > 0 && <Count value={itemCount} />}</Link>
          <div ref={accountRef} className="relative hidden sm:block">
            <HeaderButton onClick={() => setAccountOpen((open) => !open)} label="Account"><User size={19} strokeWidth={1.8} /></HeaderButton>
            <AnimatePresence>{accountOpen && <AccountMenu user={user} signOut={signOut} close={() => setAccountOpen(false)} />}</AnimatePresence>
          </div>
          <HeaderButton onClick={openMobileMenu} label="Menu" className="lg:hidden"><Menu size={21} /></HeaderButton>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-950">
            <form onSubmit={submitSearch} className="section-container flex h-24 items-center gap-4">
              <Search className="shrink-0 text-surface-400" size={22} />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What are you looking for?" className="min-w-0 flex-1 bg-transparent text-xl font-medium tracking-tight outline-none placeholder:text-surface-300 dark:placeholder:text-surface-700" />
              <button type="button" onClick={toggleSearch} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface-100 dark:hover:bg-surface-900" aria-label="Close search"><X size={19} /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function HeaderButton({ children, onClick, label, className }: { children: React.ReactNode; onClick: () => void; label: string; className?: string }) {
  return <button onClick={onClick} aria-label={label} className={clsx('grid h-10 w-10 place-items-center rounded-full text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-900', className)}>{children}</button>
}

function Count({ value }: { value: number }) {
  return <span className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">{value > 99 ? '99+' : value}</span>
}

function AccountMenu({ user, signOut, close }: { user: any; signOut: () => void; close: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-full mt-3 w-60 overflow-hidden rounded-2xl border border-surface-200 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,.12)] dark:border-surface-800 dark:bg-surface-900">
      {user ? <>
        <div className="px-3 py-3"><p className="text-sm font-semibold">{user.name || 'Your account'}</p><p className="mt-0.5 truncate text-xs text-surface-500">{user.email}</p></div>
        <MenuLink to="/account" icon={User}>Account</MenuLink><MenuLink to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</MenuLink>
        <button onClick={() => { signOut(); close() }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"><LogOut size={16} /> Sign out</button>
      </> : <div className="p-2"><p className="px-2 pb-3 text-sm text-surface-500">Sign in to view orders, saved items, and more.</p><Link to="/login" className="btn-primary w-full rounded-full">Sign in</Link><Link to="/register" className="mt-2 flex justify-center py-2 text-sm font-semibold">Create account</Link></div>}
    </motion.div>
  )
}

function MenuLink({ to, icon: Icon, children }: { to: string; icon: typeof User; children: React.ReactNode }) {
  return <Link to={to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-surface-50 dark:hover:bg-surface-800"><Icon size={16} />{children}</Link>
}
