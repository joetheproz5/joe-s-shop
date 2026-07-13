import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Dumbbell,
  Headphones,
  Home,
  RotateCcw,
  ShieldCheck,
  Shirt,
  Smartphone,
  Sparkles,
  Truck,
} from 'lucide-react'
import { useFeaturedProducts, useNewArrivals, useBestSellers } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { ProductCard } from '@/components/shop/ProductCard'
import { Skeleton } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { getProductImage } from '@/lib/productImages'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

const HERO_IMAGE = `${import.meta.env.BASE_URL}images/storefront-hero.png`
const DEFAULT_CATEGORIES = [
  { id: 'electronics', name: 'Electronics', product_count: 3, href: '/shop?search=TechPro' },
  { id: 'style', name: 'Clothing', product_count: 3, href: '/shop?search=StyleHouse' },
  { id: 'home', name: 'Home & Garden', product_count: 3, href: '/shop?search=HomeEssentials' },
  { id: 'fitness', name: 'Sports & Fitness', product_count: 2, href: '/shop?search=ActiveGear' },
  { id: 'books', name: 'Books & Media', product_count: 1, href: '/shop?search=BookWorm' },
  { id: 'new', name: 'New Arrivals', product_count: 4, href: '/shop?is_new_arrival=true' },
]

export default function HomePage() {
  const { data: settings } = useSettings()
  const { data: categories } = useCategories()
  const { data: featured, isLoading: featuredLoading } = useFeaturedProducts(8)
  const { data: arrivals, isLoading: arrivalsLoading } = useNewArrivals(4)
  const { data: bestSellers, isLoading: bestSellersLoading } = useBestSellers(4)

  const rootCategories = (categories || []).filter((category) => !category.parent_id).slice(0, 6)
  const visibleCategories = rootCategories.length > 0 ? rootCategories : DEFAULT_CATEGORIES
  const spotlight = bestSellers?.[0] || featured?.[0] || arrivals?.[0]
  const legacyTitle = settings?.hero_title?.trim() === 'Premium Products for Modern Living'
  const legacySubtitle = settings?.hero_subtitle?.trim() === "Shop handpicked essentials from the world's best brands. Fast shipping, easy returns."

  const hero = {
    title: settings?.hero_title && !legacyTitle ? settings.hero_title : 'Tech, home, style and more.',
    subtitle:
      settings?.hero_subtitle && !legacySubtitle
        ? settings.hero_subtitle
        : 'Great everyday products, clear prices, and a shopping experience that stays out of your way.',
    ctaText: settings?.hero_cta_text || 'Shop all products',
    ctaLink: settings?.hero_cta_link || '/shop',
  }

  return (
    <div className="bg-white text-surface-950 dark:bg-surface-950 dark:text-white">
      <Hero hero={hero} />
      <AssuranceBar />
      <CategorySection categories={visibleCategories} loading={false} />

      <ProductSection
        kicker="Recommended"
        title="Products worth a closer look"
        description="A focused selection of useful, well-priced picks."
        link="/shop?is_featured=true"
      >
        <ProductGrid products={featured} loading={featuredLoading} count={8} />
      </ProductSection>

      <Spotlight product={spotlight} loading={bestSellersLoading && featuredLoading} />

      <ProductSection
        kicker="Most popular"
        title="What people are buying"
        description="Reliable favorites across every department."
        link="/shop?is_best_seller=true"
      >
        <ProductGrid products={bestSellers} loading={bestSellersLoading} />
      </ProductSection>

      <ProductSection
        kicker="New arrivals"
        title="Fresh in the shop"
        description="The latest products, ready to discover."
        link="/shop?is_new_arrival=true"
      >
        <ProductGrid products={arrivals} loading={arrivalsLoading} />
      </ProductSection>

      <Newsletter />
    </div>
  )
}

function Hero({ hero }: { hero: { title: string; subtitle: string; ctaText: string; ctaLink: string } }) {
  return (
    <section
      className="relative isolate min-h-[600px] overflow-hidden border-b border-[#dfe3e8] bg-[#eef3f8] bg-cover bg-[62%_center] dark:border-surface-800"
      style={{ backgroundImage: `url(${HERO_IMAGE})` }}
    >
      <div className="absolute inset-y-0 left-0 -z-10 w-full bg-white/80 sm:w-[67%] sm:bg-white/88 lg:w-[56%] dark:bg-surface-950/85" />
      <div className="section-container flex min-h-[600px] items-center py-16">
        <div className="max-w-[580px]">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0b57d0] dark:text-blue-300"
          >
            <Sparkles size={16} /> New products added weekly
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="text-4xl font-semibold leading-[1.08] tracking-normal text-[#1f1f1f] sm:text-5xl lg:text-6xl dark:text-white"
          >
            {hero.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-6 max-w-lg text-lg leading-8 text-[#4f5660] dark:text-surface-300"
          >
            {hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to={hero.ctaLink}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0b57d0] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0842a0]"
            >
              {hero.ctaText} <ArrowRight size={17} />
            </Link>
            <Link
              to="/shop?is_new_arrival=true"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c7ccd1] bg-white/90 px-6 text-sm font-semibold text-[#202124] transition-colors hover:bg-white dark:border-surface-700 dark:bg-surface-900/90 dark:text-white"
            >
              See what's new
            </Link>
          </motion.div>
          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#5f6368] dark:text-surface-400">
            <span className="inline-flex items-center gap-2"><Truck size={17} /> Free delivery over $100</span>
            <span className="inline-flex items-center gap-2"><RotateCcw size={17} /> 30-day returns</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function AssuranceBar() {
  const items = [
    { icon: Truck, title: 'Fast delivery', detail: 'Tracked to your door' },
    { icon: RotateCcw, title: 'Easy returns', detail: '30 days, no stress' },
    { icon: ShieldCheck, title: 'Secure checkout', detail: 'Protected payments' },
    { icon: Headphones, title: 'Real support', detail: 'Help when you need it' },
  ]

  return (
    <section className="border-b border-[#e4e7eb] bg-white dark:border-surface-800 dark:bg-surface-950">
      <div className="section-container grid grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex min-h-24 items-center gap-3 border-b border-[#e4e7eb] py-5 even:pl-4 sm:px-5 lg:border-b-0 lg:border-r dark:border-surface-800 first:lg:pl-0 last:lg:border-r-0">
            <item.icon size={20} className="shrink-0 text-[#0b57d0] dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CategorySection({ categories, loading }: { categories: any[]; loading: boolean }) {
  const iconFor = (name: string) => {
    const value = name.toLowerCase()
    if (value.includes('elect')) return Smartphone
    if (value.includes('cloth') || value.includes('fashion')) return Shirt
    if (value.includes('home') || value.includes('garden')) return Home
    if (value.includes('sport') || value.includes('fitness')) return Dumbbell
    if (value.includes('book') || value.includes('media')) return BookOpen
    return Sparkles
  }

  return (
    <section className="section-container py-16 sm:py-20">
      <SectionHeader
        kicker="Departments"
        title="Shop by category"
        description="Go directly to what you're looking for."
        link="/categories"
      />
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = iconFor(category.name)
            return (
              <div key={category.id}>
                <Link
                  to={category.href || `/shop?category_id=${category.id}`}
                  className="group flex h-36 flex-col justify-between rounded-lg border border-[#e0e4e8] bg-[#f8fafd] p-4 transition-all hover:border-[#a8c7fa] hover:bg-[#f0f6ff] dark:border-surface-800 dark:bg-surface-900 dark:hover:border-blue-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#0b57d0] shadow-sm ring-1 ring-[#e0e4e8] dark:bg-surface-800 dark:text-blue-400 dark:ring-surface-700">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="line-clamp-1 text-sm font-semibold">{category.name}</p>
                    <p className="mt-1 flex items-center justify-between text-xs text-surface-500">
                      {category.product_count || 0} products
                      <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function ProductSection({ kicker, title, description, link, children }: {
  kicker: string
  title: string
  description: string
  link: string
  children: React.ReactNode
}) {
  return (
    <section className="section-container py-14 sm:py-16">
      <SectionHeader kicker={kicker} title={title} description={description} link={link} />
      {children}
    </section>
  )
}

function Spotlight({ product, loading }: { product?: Product; loading: boolean }) {
  if (loading) return <div className="section-container py-8"><Skeleton className="h-[440px] rounded-lg" /></div>

  return (
    <section className="my-10 border-y border-[#dce6f2] bg-[#eef5ff] dark:border-blue-950 dark:bg-blue-950/20">
      <div className="section-container grid min-h-[440px] items-center gap-8 py-10 lg:grid-cols-2 lg:py-0">
        <div className="max-w-xl py-6">
          <p className="text-sm font-semibold text-[#0b57d0] dark:text-blue-300">Designed for everyday life</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">One shop. Better choices.</h2>
          <p className="mt-5 text-lg leading-8 text-[#56606b] dark:text-surface-300">
            Discover products that solve real needs without the endless scrolling. Clear details, honest prices, and quick delivery.
          </p>
          <Link to="/shop" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0b57d0] hover:text-[#0842a0] dark:text-blue-300">
            Explore everything <ArrowRight size={17} />
          </Link>
        </div>
        {product && (
          <Link to={`/product/${product.slug}`} className="group relative h-[360px] overflow-hidden rounded-lg bg-white lg:h-[440px] lg:rounded-none dark:bg-surface-900">
            <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-lg bg-white/95 p-4 shadow-md backdrop-blur-sm dark:bg-surface-950/90">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#0b57d0]">Featured</p>
                <h3 className="mt-1 line-clamp-1 font-semibold">{product.name}</h3>
              </div>
              <p className="shrink-0 font-semibold">{formatCurrency(product.sale_price ?? product.selling_price)}</p>
            </div>
          </Link>
        )}
      </div>
    </section>
  )
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const benefits = useMemo(() => ['New arrivals', 'Useful deals', 'No inbox clutter'], [])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email) return
    toast.success('You are on the list.')
    setEmail('')
  }

  return (
    <section className="mt-12 border-t border-[#dfe3e8] bg-[#f7f9fc] dark:border-surface-800 dark:bg-surface-900/60">
      <div className="section-container grid gap-8 py-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-[#0b57d0] dark:text-blue-400">Joe's newsletter</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">The good stuff, occasionally.</h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-surface-500 dark:text-surface-400">
            {benefits.map((benefit) => <span key={benefit} className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#0b57d0]" />{benefit}</span>)}
          </div>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="newsletter-email">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="h-12 flex-1 rounded-lg border border-[#c8cdd3] bg-white px-4 text-sm outline-none transition-shadow focus:border-[#0b57d0] focus:ring-2 focus:ring-[#0b57d0]/15 dark:border-surface-700 dark:bg-surface-950"
          />
          <button type="submit" className="h-12 rounded-lg bg-[#0b57d0] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0842a0]">Sign up</button>
        </form>
      </div>
    </section>
  )
}

function ProductGrid({ products, loading, count = 4 }: { products: Product[] | undefined; loading: boolean; count?: number }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => <Skeleton key={index} variant="card" />)}
      </div>
    )
  }

  if (!products?.length) {
    return <div className="rounded-lg border border-dashed border-surface-300 py-12 text-center text-sm text-surface-500">No products available yet.</div>
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-5">
      {products.slice(0, count).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
    </div>
  )
}

function SectionHeader({ kicker, title, description, link }: {
  kicker: string
  title: string
  description: string
  link?: string
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-5">
      <div>
        <p className="text-sm font-semibold text-[#0b57d0] dark:text-blue-400">{kicker}</p>
        <h2 className="mt-1.5 text-2xl font-semibold tracking-normal sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-surface-500 sm:text-base dark:text-surface-400">{description}</p>
      </div>
      {link && (
        <Link to={link} className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-[#0b57d0] hover:text-[#0842a0] sm:flex dark:text-blue-400">
          View all <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}

