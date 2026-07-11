import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Box,
  ChevronRight,
  Quote,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Zap,
} from 'lucide-react'
import { useFeaturedProducts, useNewArrivals, useBestSellers } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { ProductCard } from '@/components/shop/ProductCard'
import { Skeleton } from '@/components/ui'
import { SITE_NAME } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

export default function HomePage() {
  const { data: settings } = useSettings()
  const { data: categories, isLoading: catLoading } = useCategories()
  const { data: featured, isLoading: featLoading } = useFeaturedProducts(8)
  const { data: arrivals, isLoading: arrLoading } = useNewArrivals(4)
  const { data: bestSellers, isLoading: bestLoading } = useBestSellers(4)

  const hero = {
    title: settings?.hero_title || 'Curated gear for sharper everyday living',
    subtitle:
      settings?.hero_subtitle ||
      'Shop useful, well-made products across tech, style, home, fitness, and books.',
    ctaText: settings?.hero_cta_text || 'Shop the edit',
    ctaLink: settings?.hero_cta_link || '/shop',
  }

  const topCats = (categories || []).filter((c) => !c.parent_id).slice(0, 5)
  const heroProducts = (featured || []).slice(0, 3)

  return (
    <div className="bg-white text-surface-950 dark:bg-surface-950 dark:text-white">
      <section className="relative overflow-hidden border-b border-surface-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] dark:border-surface-800 dark:bg-[linear-gradient(180deg,#0d1117_0%,#111827_100%)]">
        <div className="section-container grid min-h-[calc(100vh-72px)] items-center gap-12 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-surface-600 shadow-sm dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300"
            >
              <Sparkles size={14} className="text-primary-500" />
              {SITE_NAME} selection
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-surface-950 dark:text-white sm:text-6xl lg:text-7xl"
            >
              {hero.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 max-w-xl text-base leading-8 text-surface-600 dark:text-surface-300 sm:text-lg"
            >
              {hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to={hero.ctaLink}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-surface-950 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-surface-950/10 transition-transform hover:-translate-y-0.5 active:translate-y-0 dark:bg-white dark:text-surface-950"
              >
                {hero.ctaText}
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/shop?is_new_arrival=true"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-surface-300 bg-white px-6 py-3 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-white dark:hover:bg-surface-800"
              >
                New arrivals
                <ChevronRight size={18} />
              </Link>
            </motion.div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-surface-200 pt-6 dark:border-surface-800">
              {[
                ['12+', 'curated categories'],
                ['30d', 'easy returns'],
                ['24/7', 'secure checkout'],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="text-2xl font-black text-surface-950 dark:text-white">{value}</div>
                  <div className="mt-1 text-xs font-medium text-surface-500 dark:text-surface-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <HeroProductStage products={heroProducts} loading={featLoading} />
        </div>

        <div className="border-t border-surface-200 bg-white/80 backdrop-blur dark:border-surface-800 dark:bg-surface-950/80">
          <div className="section-container grid gap-3 py-4 text-sm text-surface-600 dark:text-surface-300 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, label: 'Free shipping over $100' },
              { icon: RotateCcw, label: '30-day returns' },
              { icon: ShieldCheck, label: 'Protected payments' },
              { icon: BadgeCheck, label: 'Verified product picks' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon size={18} className="text-primary-500" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-300">
              Browse faster
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Shop by category</h2>
          </div>
          <Link to="/shop" className="hidden items-center gap-1 text-sm font-bold text-surface-700 hover:text-primary-600 dark:text-surface-300 sm:flex">
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {catLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {topCats.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/shop?category_id=${cat.id}`}
                  className="group block rounded-lg border border-surface-200 bg-surface-50 p-4 transition-all hover:-translate-y-1 hover:border-surface-300 hover:bg-white hover:shadow-xl hover:shadow-surface-950/5 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:bg-surface-900/80"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-white text-2xl font-black text-surface-900 shadow-sm transition-transform group-hover:rotate-3 group-hover:scale-105 dark:bg-surface-800 dark:text-white">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      cat.name[0]
                    )}
                  </div>
                  <div className="font-bold text-surface-950 dark:text-white">{cat.name}</div>
                  <div className="mt-1 text-xs text-surface-500">{cat.product_count || 0} items</div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <ProductSection
        eyebrow="Editor picks"
        title="Featured products"
        subtitle="The pieces we would put at the top of the shelf."
        link="/shop?is_featured=true"
      >
        <ProductGrid products={featured} loading={featLoading} />
      </ProductSection>

      <section className="my-8 border-y border-surface-200 bg-surface-950 text-white dark:border-surface-800">
        <div className="section-container grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-300">Limited drop</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Upgrade the everyday kit without the clutter.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Zap, title: 'Fast picks', text: 'Top items, easy scanning.' },
              { icon: Box, title: 'Clean stock', text: 'Useful gear across categories.' },
              { icon: ShieldCheck, title: 'Low risk', text: 'Secure checkout and returns.' },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <item.icon size={22} className="mb-4 text-primary-300" />
                <div className="font-bold">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-surface-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductSection
        eyebrow="Proven sellers"
        title="Best sellers"
        subtitle="The items customers keep coming back for."
        link="/shop?is_best_seller=true"
      >
        <ProductGrid products={bestSellers} loading={bestLoading} />
      </ProductSection>

      <ProductSection
        eyebrow="Fresh shelf"
        title="New arrivals"
        subtitle="Recently added products, ready to browse."
        link="/shop?is_new_arrival=true"
      >
        <ProductGrid products={arrivals} loading={arrLoading} />
      </ProductSection>

      <section className="section-container py-14">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              name: 'Sarah K.',
              text: 'The site is easy to shop and the products feel properly selected, not random.',
            },
            {
              name: 'Mike R.',
              text: 'Fast checkout, clean product pages, and the order arrived exactly as expected.',
            },
            {
              name: 'Emily L.',
              text: 'I found what I needed in two minutes. That is the kind of store I come back to.',
            },
          ].map((t) => (
            <div key={t.name} className="rounded-lg border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-800 dark:bg-surface-900">
              <Quote className="mb-4 text-primary-500" size={26} />
              <p className="leading-7 text-surface-700 dark:text-surface-300">"{t.text}"</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="font-bold">{t.name}</div>
                <div className="flex text-warning-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container pb-16">
        <Newsletter />
      </section>
    </div>
  )
}

function HeroProductStage({ products, loading }: { products: Product[]; loading: boolean }) {
  const first = products[0]
  const second = products[1]
  const third = products[2]

  if (loading) {
    return <Skeleton className="h-[520px] rounded-lg" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.18 }}
      className="perspective-scene relative mx-auto h-[520px] w-full max-w-[620px]"
    >
      <div className="absolute inset-x-8 bottom-6 h-16 rounded-[50%] bg-surface-950/10 blur-2xl dark:bg-black/50" />

      <Link
        to={first ? `/product/${first.slug}` : '/shop'}
        className="hero-product-plane hero-product-plane-main group absolute left-[8%] top-[7%] z-30 block w-[66%] overflow-hidden rounded-lg border border-surface-200 bg-white shadow-2xl shadow-surface-950/20 dark:border-surface-800 dark:bg-surface-900"
      >
        <ProductStageImage product={first} label="Featured" />
        <div className="p-5">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-300">
            Featured
          </div>
          <div className="mt-2 line-clamp-2 text-xl font-black tracking-tight">{first?.name || 'Shop the latest edit'}</div>
          <div className="mt-3 text-sm font-bold text-surface-600 dark:text-surface-300">
            {first ? formatCurrency(first.sale_price ?? first.selling_price) : 'Browse products'}
          </div>
        </div>
      </Link>

      <Link
        to={second ? `/product/${second.slug}` : '/shop'}
        className="hero-product-plane hero-product-plane-side absolute right-[3%] top-[21%] z-20 block w-[43%] overflow-hidden rounded-lg border border-surface-200 bg-white shadow-xl shadow-surface-950/10 dark:border-surface-800 dark:bg-surface-900"
      >
        <ProductStageImage product={second} label="New" compact />
      </Link>

      <Link
        to={third ? `/product/${third.slug}` : '/shop'}
        className="hero-product-plane hero-product-plane-base absolute bottom-[10%] right-[16%] z-10 block w-[48%] overflow-hidden rounded-lg border border-surface-200 bg-white shadow-xl shadow-surface-950/10 dark:border-surface-800 dark:bg-surface-900"
      >
        <ProductStageImage product={third} label="Popular" compact />
      </Link>
    </motion.div>
  )
}

function ProductStageImage({ product, label, compact = false }: { product?: Product; label: string; compact?: boolean }) {
  const image = product?.images?.find((img) => img.is_featured)?.url || product?.images?.[0]?.url

  return (
    <div className={compact ? 'relative aspect-[4/3]' : 'relative aspect-[5/4]'}>
      {image ? (
        <img src={image} alt={product?.name || label} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-surface-100 text-surface-400 dark:bg-surface-800">
          <Box size={compact ? 34 : 56} />
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-surface-900 shadow-sm backdrop-blur dark:bg-surface-950/90 dark:text-white">
        {label}
      </span>
    </div>
  )
}

function ProductSection({
  eyebrow,
  title,
  subtitle,
  link,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  link: string
  children: React.ReactNode
}) {
  return (
    <section className="section-container py-12">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-300">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">{subtitle}</p>
        </div>
        <Link to={link} className="hidden items-center gap-1 text-sm font-bold text-surface-700 hover:text-primary-600 dark:text-surface-300 sm:flex">
          View all
          <ArrowRight size={16} />
        </Link>
      </div>
      {children}
    </section>
  )
}

function ProductGrid({ products, loading }: { products: Product[] | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-surface-300 py-10 text-center text-surface-500 dark:border-surface-700">
        No products available yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  )
}

function Newsletter() {
  const [email, setEmail] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success('Thanks for subscribing!')
    setEmail('')
  }

  return (
    <div className="grid overflow-hidden rounded-lg border border-surface-200 bg-white shadow-sm dark:border-surface-800 dark:bg-surface-900 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="p-7 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-300">Newsletter</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Get the good stuff first.</h2>
        <p className="mt-3 max-w-xl leading-7 text-surface-600 dark:text-surface-300">
          New drops, sharper deals, and a welcome code for your first order.
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field flex-1 rounded-lg"
          />
          <button type="submit" className="rounded-lg bg-surface-950 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-surface-950">
            Subscribe
          </button>
        </form>
      </div>
      <div className="flex items-center justify-center border-t border-surface-200 bg-surface-50 p-8 dark:border-surface-800 dark:bg-surface-950 lg:border-l lg:border-t-0">
        <div className="text-center">
          <div className="text-6xl font-black tracking-tight text-surface-950 dark:text-white">10%</div>
          <div className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-surface-500">welcome code</div>
        </div>
      </div>
    </div>
  )
}
