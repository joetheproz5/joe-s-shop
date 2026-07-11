import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Box,
  ChevronRight,
  CircleDollarSign,
  PackageCheck,
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
    title: settings?.hero_title || 'A sharper store for products worth noticing.',
    subtitle:
      settings?.hero_subtitle ||
      'Joe\'s Shop brings tech, style, home, fitness, and media into one fast, polished shopping experience.',
    ctaText: settings?.hero_cta_text || 'Enter the shop',
    ctaLink: settings?.hero_cta_link || '/shop',
  }

  const topCats = (categories || []).filter((c) => !c.parent_id).slice(0, 6)
  const heroProducts = (featured || bestSellers || arrivals || []).slice(0, 4)

  return (
    <div className="bg-[#f5f7fb] text-surface-950 dark:bg-surface-950 dark:text-white">
      <HeroShowroom hero={hero} products={heroProducts} loading={featLoading && bestLoading && arrLoading} />
      <AssuranceStrip />
      <CategoryRunway categories={topCats} loading={catLoading} />

      <ProductRunway
        eyebrow="Featured edit"
        title="Products with shelf presence"
        subtitle="A tighter collection layout with motion, depth, and easy scanning."
        link="/shop?is_featured=true"
      >
        <ProductGrid products={featured} loading={featLoading} />
      </ProductRunway>

      <LaunchPanel products={(bestSellers || featured || []).slice(0, 3)} />

      <ProductRunway
        eyebrow="Best sellers"
        title="The stuff people actually buy"
        subtitle="Products with proven traction, kept close to the front."
        link="/shop?is_best_seller=true"
      >
        <ProductGrid products={bestSellers} loading={bestLoading} />
      </ProductRunway>

      <ProductRunway
        eyebrow="Fresh arrivals"
        title="New drops in rotation"
        subtitle="Recently added products with a little stage lighting."
        link="/shop?is_new_arrival=true"
      >
        <ProductGrid products={arrivals} loading={arrLoading} />
      </ProductRunway>

      <ReviewWall />
      <Newsletter />
    </div>
  )
}

function HeroShowroom({
  hero,
  products,
  loading,
}: {
  hero: { title: string; subtitle: string; ctaText: string; ctaLink: string }
  products: Product[]
  loading: boolean
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const onMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: x * 18, y: y * -18 })
  }

  const sceneStyle = {
    '--tilt-x': `${tilt.y}deg`,
    '--tilt-y': `${tilt.x}deg`,
  } as CSSProperties

  return (
    <section
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="showroom relative isolate overflow-hidden bg-[#0b1020] text-white"
    >
      <div className="showroom-grid absolute inset-0 opacity-70" />
      <div className="showroom-scan absolute inset-x-0 top-0 h-px" />

      <div className="section-container grid min-h-[calc(100vh-72px)] items-center gap-12 py-16 lg:grid-cols-[0.88fr_1.12fr] lg:py-20">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-surface-200 backdrop-blur"
          >
            <Sparkles size={14} className="text-cyan-300" />
            {SITE_NAME} 3D storefront
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mt-7 max-w-4xl text-5xl font-black leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-6 max-w-xl text-base leading-8 text-surface-300 sm:text-lg"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to={hero.ctaLink}
              className="group inline-flex items-center justify-center gap-2 bg-white px-6 py-3 text-sm font-black text-surface-950 shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition-transform hover:-translate-y-1"
            >
              {hero.ctaText}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/shop?is_new_arrival=true"
              className="inline-flex items-center justify-center gap-2 border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-black text-white backdrop-blur transition-colors hover:bg-white/[0.1]"
            >
              Watch new drops
              <ChevronRight size={18} />
            </Link>
          </motion.div>

          <div className="mt-10 grid max-w-xl grid-cols-3 border-y border-white/10">
            {[
              ['360', 'visual depth'],
              ['Fast', 'shop flow'],
              ['Live', 'catalog data'],
            ].map(([value, label]) => (
              <div key={label} className="border-r border-white/10 py-4 last:border-r-0">
                <div className="text-2xl font-black">{value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-surface-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={sceneStyle} className="relative z-10">
          {loading ? <Skeleton className="h-[560px] bg-white/10" /> : <ProductOrbit products={products} />}
        </div>
      </div>

      <div className="showroom-marquee border-y border-white/10 bg-white/[0.04] py-3 text-xs font-black uppercase tracking-[0.22em] text-surface-300">
        <div className="showroom-marquee-track">
          {Array.from({ length: 2 }).map((_, group) => (
            <div key={group} className="flex shrink-0 items-center gap-8 px-4">
              <span>Premium catalog</span>
              <span>Animated storefront</span>
              <span>Fast checkout</span>
              <span>Admin powered</span>
              <span>Supabase backed</span>
              <span>Responsive commerce</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductOrbit({ products }: { products: Product[] }) {
  const primary = products[0]
  const support = products.slice(1, 4)

  return (
    <div className="orbit-stage relative mx-auto h-[560px] max-w-[680px]">
      <div className="orbit-ring orbit-ring-one" />
      <div className="orbit-ring orbit-ring-two" />
      <div className="orbit-platform" />

      <Link
        to={primary ? `/product/${primary.slug}` : '/shop'}
        className="orbit-card orbit-card-main group absolute left-[16%] top-[6%] z-30 w-[62%] overflow-hidden border border-white/12 bg-white text-surface-950 shadow-2xl shadow-black/40"
      >
        <ProductImage product={primary} className="aspect-[4/3]" />
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-primary-600">Spotlight</span>
            <span className="text-sm font-black">{primary ? formatCurrency(primary.sale_price ?? primary.selling_price) : 'Shop'}</span>
          </div>
          <div className="mt-3 line-clamp-2 text-2xl font-black leading-tight">{primary?.name || 'Start browsing'}</div>
        </div>
      </Link>

      {support.map((product, index) => (
        <Link
          key={product.id}
          to={`/product/${product.slug}`}
          className={`orbit-card orbit-card-small orbit-card-small-${index + 1} group absolute z-20 w-[34%] overflow-hidden border border-white/12 bg-white text-surface-950 shadow-xl shadow-black/30`}
        >
          <ProductImage product={product} className="aspect-square" />
          <div className="p-3">
            <div className="line-clamp-1 text-sm font-black">{product.name}</div>
            <div className="mt-1 text-xs font-bold text-surface-500">{formatCurrency(product.sale_price ?? product.selling_price)}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function ProductImage({ product, className }: { product?: Product; className: string }) {
  const image = product?.images?.find((img) => img.is_featured)?.url || product?.images?.[0]?.url

  return (
    <div className={`relative overflow-hidden bg-surface-100 ${className}`}>
      {image ? (
        <img src={image} alt={product?.name || 'Product'} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-surface-400">
          <Box size={48} />
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.36),transparent_42%,rgba(15,23,42,0.18))]" />
    </div>
  )
}

function AssuranceStrip() {
  return (
    <section className="border-b border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-950">
      <div className="section-container grid gap-0 py-0 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Truck, label: 'Fast shipping', text: 'Free over $100' },
          { icon: RotateCcw, label: 'Simple returns', text: '30-day window' },
          { icon: ShieldCheck, label: 'Secure payments', text: 'Protected checkout' },
          { icon: PackageCheck, label: 'Curated stock', text: 'Useful products only' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 border-b border-surface-200 py-5 sm:border-r sm:px-5 lg:border-b-0 first:sm:pl-0 last:border-r-0 dark:border-surface-800">
            <div className="flex h-11 w-11 items-center justify-center bg-surface-950 text-white dark:bg-white dark:text-surface-950">
              <item.icon size={20} />
            </div>
            <div>
              <div className="font-black">{item.label}</div>
              <div className="text-sm text-surface-500 dark:text-surface-400">{item.text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CategoryRunway({ categories, loading }: { categories: any[]; loading: boolean }) {
  return (
    <section className="section-container py-16">
      <SectionHeading eyebrow="Choose your lane" title="Categories that move like shelves" subtitle="A faster way into the catalog with depth and motion built in." link="/shop" />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
        <div className="category-tilt-grid grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 26, rotateX: 12 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                to={`/shop?category_id=${cat.id}`}
                className="category-tilt-card group flex h-44 flex-col justify-between border border-surface-200 bg-white p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center bg-surface-950 text-2xl font-black text-white transition-transform group-hover:rotate-6 dark:bg-white dark:text-surface-950">
                    {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" /> : cat.name[0]}
                  </div>
                  <ArrowRight size={18} className="text-surface-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-500" />
                </div>
                <div>
                  <div className="font-black leading-tight">{cat.name}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-surface-500">{cat.product_count || 0} items</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

function ProductRunway({
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
    <section className="section-container py-14">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} link={link} />
      {children}
    </section>
  )
}

function LaunchPanel({ products }: { products: Product[] }) {
  const active = products[0]

  return (
    <section className="relative overflow-hidden bg-[#111827] text-white">
      <div className="showroom-grid absolute inset-0 opacity-30" />
      <div className="section-container relative grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Motion commerce</p>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Build a store that feels alive, not flat.
          </h2>
          <p className="mt-5 max-w-xl leading-8 text-surface-300">
            Layered product displays, clean admin-driven data, and small animated moments make browsing feel premium without slowing people down.
          </p>
          <Link to="/shop" className="mt-8 inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-black text-surface-950 transition-transform hover:-translate-y-1">
            Browse catalog
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {products.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className={`launch-product-card group overflow-hidden border border-white/10 bg-white/[0.06] backdrop-blur ${index === 1 ? 'sm:translate-y-8' : ''}`}
            >
              <ProductImage product={product} className="aspect-[4/5]" />
              <div className="p-4">
                <div className="line-clamp-2 font-black">{product.name}</div>
                <div className="mt-2 text-sm font-bold text-cyan-200">{formatCurrency(product.sale_price ?? product.selling_price)}</div>
              </div>
            </Link>
          ))}

          {products.length === 0 && (
            <div className="col-span-full border border-white/10 bg-white/[0.06] p-8 text-center text-surface-300">
              Add featured products to power this animated shelf.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ReviewWall() {
  return (
    <section className="section-container py-16">
      <SectionHeading eyebrow="Signal check" title="Professional, but not boring" subtitle="Sharper UI, better pacing, and enough motion to feel premium." />
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ['Nadia R.', 'The homepage finally feels like a modern store instead of a generic catalog.'],
          ['Chris M.', 'The 3D product stage grabs attention without making checkout harder.'],
          ['Elena P.', 'Clean sections, fast scanning, and a design that actually fits ecommerce.'],
        ].map(([name, text], index) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-800 dark:bg-surface-900"
          >
            <Quote className="mb-5 text-primary-500" size={28} />
            <p className="leading-7 text-surface-700 dark:text-surface-300">"{text}"</p>
            <div className="mt-6 flex items-center justify-between">
              <div className="font-black">{name}</div>
              <div className="flex text-warning-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function Newsletter() {
  const [email, setEmail] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success('You are on the list.')
    setEmail('')
  }

  return (
    <section className="section-container pb-16">
      <div className="grid overflow-hidden border border-surface-200 bg-white shadow-sm dark:border-surface-800 dark:bg-surface-900 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-8 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-600 dark:text-primary-300">Drop alerts</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Get first look at the next shelf.</h2>
          <p className="mt-3 max-w-xl leading-7 text-surface-600 dark:text-surface-300">
            Product drops, limited offers, and a cleaner way to keep up with the catalog.
          </p>
          <form onSubmit={submit} className="mt-7 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field flex-1 rounded-none"
            />
            <button type="submit" className="bg-surface-950 px-6 py-3 text-sm font-black text-white transition-transform hover:-translate-y-1 dark:bg-white dark:text-surface-950">
              Join list
            </button>
          </form>
        </div>
        <div className="relative flex min-h-64 items-center justify-center border-t border-surface-200 bg-surface-950 p-8 text-white dark:border-surface-800 lg:border-l lg:border-t-0">
          <div className="newsletter-cube">
            <div className="newsletter-cube-face newsletter-cube-front"><CircleDollarSign size={44} /></div>
            <div className="newsletter-cube-face newsletter-cube-back"><Sparkles size={44} /></div>
            <div className="newsletter-cube-face newsletter-cube-right"><Zap size={44} /></div>
            <div className="newsletter-cube-face newsletter-cube-left"><PackageCheck size={44} /></div>
            <div className="newsletter-cube-face newsletter-cube-top">10%</div>
            <div className="newsletter-cube-face newsletter-cube-bottom">VIP</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductGrid({ products, loading }: { products: Product[] | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="border border-dashed border-surface-300 bg-white py-12 text-center font-semibold text-surface-500 dark:border-surface-700 dark:bg-surface-900">
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

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  link,
}: {
  eyebrow: string
  title: string
  subtitle: string
  link?: string
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-600 dark:text-primary-300">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-surface-600 dark:text-surface-300">{subtitle}</p>
      </div>
      {link && (
        <Link to={link} className="hidden shrink-0 items-center gap-2 text-sm font-black text-surface-700 transition-colors hover:text-primary-600 dark:text-surface-300 sm:flex">
          View all
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}
