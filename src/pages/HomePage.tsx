import { useState } from 'react'
import type { CSSProperties } from 'react'
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
  Star,
  Truck,
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
    title: settings?.hero_title || 'A modern shop with depth, motion, and taste.',
    subtitle:
      settings?.hero_subtitle ||
      'Curated products across tech, style, home, fitness, and books, presented like a real premium storefront.',
    ctaText: settings?.hero_cta_text || 'Shop the collection',
    ctaLink: settings?.hero_cta_link || '/shop',
  }

  const topCats = (categories || []).filter((c) => !c.parent_id).slice(0, 6)
  const heroProducts = [...(featured || []), ...(bestSellers || []), ...(arrivals || [])]
    .filter((product, index, list) => list.findIndex((p) => p.id === product.id) === index)
    .slice(0, 6)

  return (
    <div className="bg-[#f3f0e8] text-[#151411] dark:bg-[#0f1115] dark:text-white">
      <AxisHero hero={hero} products={heroProducts} loading={featLoading && bestLoading && arrLoading} />
      <ServiceRow />
      <DepartmentGrid categories={topCats} loading={catLoading} />

      <ProductSection
        kicker="Featured"
        title="The curated shelf"
        subtitle="Strong picks up front, built for fast scanning and confident buying."
        link="/shop?is_featured=true"
      >
        <ProductGrid products={featured} loading={featLoading} />
      </ProductSection>

      <SplitFeature products={(bestSellers || featured || []).slice(0, 3)} />

      <ProductSection
        kicker="Best sellers"
        title="The proven picks"
        subtitle="The products customers keep choosing from the catalog."
        link="/shop?is_best_seller=true"
      >
        <ProductGrid products={bestSellers} loading={bestLoading} />
      </ProductSection>

      <ProductSection
        kicker="New arrivals"
        title="Fresh on the floor"
        subtitle="New products with a clean layout and subtle motion."
        link="/shop?is_new_arrival=true"
      >
        <ProductGrid products={arrivals} loading={arrLoading} />
      </ProductSection>

      <ProofAndNewsletter />
    </div>
  )
}

function AxisHero({
  hero,
  products,
  loading,
}: {
  hero: { title: string; subtitle: string; ctaText: string; ctaLink: string }
  products: Product[]
  loading: boolean
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = products[activeIndex] || products[0]

  return (
    <section className="axis-hero relative isolate overflow-hidden bg-[#151411] text-white">
      <div className="axis-noise absolute inset-0" />
      <div className="axis-light axis-light-one" />
      <div className="axis-light axis-light-two" />

      <div className="section-container relative grid min-h-[calc(100vh-72px)] items-center gap-14 py-16 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-[#d8c7a5] backdrop-blur"
          >
            <span className="h-2 w-2 bg-[#d8c7a5]" />
            {SITE_NAME} studio
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-3xl text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-xl text-lg leading-8 text-[#cbc5b7]"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to={hero.ctaLink}
              className="group inline-flex items-center justify-center gap-2 bg-[#f3f0e8] px-6 py-3 text-sm font-black text-[#151411] transition-transform hover:-translate-y-0.5"
            >
              {hero.ctaText}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/shop?is_new_arrival=true"
              className="inline-flex items-center justify-center gap-2 border border-white/15 bg-white/[0.05] px-6 py-3 text-sm font-black text-white backdrop-blur transition-colors hover:bg-white/[0.1]"
            >
              New arrivals
              <ChevronRight size={18} />
            </Link>
          </motion.div>

          <div className="mt-10 grid max-w-xl grid-cols-3 border-y border-white/10">
            {[
              ['3D', 'product stage'],
              ['Fast', 'catalog flow'],
              ['Admin', 'managed stock'],
            ].map(([value, label]) => (
              <div key={label} className="border-r border-white/10 py-4 pr-4 last:border-r-0">
                <div className="text-2xl font-black">{value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#8f8879]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          {loading ? (
            <Skeleton className="h-[580px] bg-white/10" />
          ) : (
            <div className="axis-stage-wrap">
              <div className="axis-orbit-shadow" />
              <div className="axis-stage" aria-label="Featured product carousel">
                {(products.length ? products : []).slice(0, 6).map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    className="axis-panel group"
                    style={{ '--panel-index': index } as CSSProperties}
                  >
                    <ProductImage product={product} className="aspect-[4/5]" />
                    <div className="p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8b6f45]">Featured</p>
                      <h2 className="mt-2 line-clamp-2 text-lg font-black leading-tight">{product.name}</h2>
                      <div className="mt-3 text-sm font-black text-[#151411]">
                        {formatCurrency(product.sale_price ?? product.selling_price)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="axis-display">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d8c7a5]">Currently staged</p>
                  <h3 className="mt-2 line-clamp-2 text-xl font-black">{active?.name || 'Featured products'}</h3>
                </div>
                <Link to={active ? `/product/${active.slug}` : '/shop'} className="text-sm font-black text-[#d8c7a5]">
                  View
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ProductImage({ product, className }: { product?: Product; className: string }) {
  const image = product?.images?.find((img) => img.is_featured)?.url || product?.images?.[0]?.url

  return (
    <div className={`relative overflow-hidden bg-[#ded6c7] dark:bg-surface-800 ${className}`}>
      {image ? (
        <img src={image} alt={product?.name || 'Product'} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#806742] dark:text-surface-400">
          <Box size={44} />
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.22),transparent_42%,rgba(0,0,0,0.18))]" />
    </div>
  )
}

function ServiceRow() {
  return (
    <section className="border-b border-[#151411]/10 bg-[#f3f0e8] dark:border-white/10 dark:bg-[#0f1115]">
      <div className="section-container grid sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Truck, label: 'Fast shipping', text: 'Free over $100' },
          { icon: RotateCcw, label: 'Easy returns', text: '30-day window' },
          { icon: ShieldCheck, label: 'Secure checkout', text: 'Protected payments' },
          { icon: BadgeCheck, label: 'Curated products', text: 'Picked with purpose' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 border-b border-[#151411]/10 py-5 sm:border-r sm:px-5 lg:border-b-0 first:sm:pl-0 last:border-r-0 dark:border-white/10">
            <div className="flex h-11 w-11 items-center justify-center bg-[#151411] text-[#f3f0e8] dark:bg-[#f3f0e8] dark:text-[#151411]">
              <item.icon size={20} />
            </div>
            <div>
              <div className="font-black">{item.label}</div>
              <div className="text-sm text-[#6a6255] dark:text-surface-400">{item.text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function DepartmentGrid({ categories, loading }: { categories: any[]; loading: boolean }) {
  return (
    <section className="section-container py-16">
      <SectionHeading
        kicker="Departments"
        title="Shop by category"
        subtitle="Clean paths into the catalog, with enough depth to feel designed."
        link="/shop"
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="department-grid grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                to={`/shop?category_id=${cat.id}`}
                className="department-card group flex h-48 flex-col justify-between border border-[#151411]/10 bg-white p-4 dark:border-white/10 dark:bg-surface-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-16 w-16 items-center justify-center bg-[#151411] text-3xl font-black text-[#f3f0e8] transition-transform group-hover:rotate-3 dark:bg-[#f3f0e8] dark:text-[#151411]">
                    {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" /> : cat.name[0]}
                  </div>
                  <ArrowRight size={18} className="text-[#8a806f] transition-transform group-hover:translate-x-1" />
                </div>
                <div>
                  <div className="font-black leading-tight">{cat.name}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#8b6f45]">{cat.product_count || 0} items</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

function ProductSection({
  kicker,
  title,
  subtitle,
  link,
  children,
}: {
  kicker: string
  title: string
  subtitle: string
  link: string
  children: React.ReactNode
}) {
  return (
    <section className="section-container py-14">
      <SectionHeading kicker={kicker} title={title} subtitle={subtitle} link={link} />
      {children}
    </section>
  )
}

function SplitFeature({ products }: { products: Product[] }) {
  return (
    <section className="overflow-hidden bg-[#151411] text-white">
      <div className="section-container grid gap-10 py-16 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#d8c7a5]">Studio picks</p>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Premium does not mean noisy.
          </h2>
          <p className="mt-5 max-w-xl leading-8 text-[#cbc5b7]">
            The motion is in the product stage. The rest of the page stays disciplined: strong type, useful hierarchy, and fast buying.
          </p>
          <Link to="/shop" className="mt-8 inline-flex items-center gap-2 bg-[#f3f0e8] px-6 py-3 text-sm font-black text-[#151411] transition-transform hover:-translate-y-0.5">
            Browse everything
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="feature-rail grid gap-4 md:grid-cols-3">
          {products.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="feature-rail-card group overflow-hidden bg-[#f3f0e8] text-[#151411]"
              style={{ '--rail-offset': `${index * 28}px` } as CSSProperties}
            >
              <ProductImage product={product} className="aspect-[4/5]" />
              <div className="p-4">
                <h3 className="line-clamp-2 font-black leading-tight">{product.name}</h3>
                <div className="mt-2 text-sm font-black text-[#8b6f45]">
                  {formatCurrency(product.sale_price ?? product.selling_price)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProofAndNewsletter() {
  const [email, setEmail] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success('You are on the list.')
    setEmail('')
  }

  return (
    <section className="section-container py-16">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ['Real store energy', 'Product first, not effects first.'],
          ['3D that works', 'The hero stage has real perspective and rotating panels.'],
          ['Built to shop', 'Clear categories, clean product grids, fast CTAs.'],
        ].map(([title, text], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="border border-[#151411]/10 bg-white p-6 dark:border-white/10 dark:bg-surface-900"
          >
            <Quote className="mb-5 text-[#8b6f45]" size={28} />
            <h3 className="font-black">{title}</h3>
            <p className="mt-3 leading-7 text-[#6a6255] dark:text-surface-300">"{text}"</p>
            <div className="mt-5 flex text-warning-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid border border-[#151411]/10 bg-white dark:border-white/10 dark:bg-surface-900 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-8 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#8b6f45]">Drop list</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Get new edits first.</h2>
          <p className="mt-3 max-w-xl leading-7 text-[#6a6255] dark:text-surface-300">
            Product drops, limited offers, and better picks without inbox clutter.
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
            <button type="submit" className="bg-[#151411] px-6 py-3 text-sm font-black text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-surface-950">
              Join list
            </button>
          </form>
        </div>
        <div className="newsletter-disc flex items-center justify-center border-t border-[#151411]/10 bg-[#d8c7a5] p-8 dark:border-white/10 lg:border-l lg:border-t-0">
          <div className="newsletter-disc-inner flex h-44 w-44 items-center justify-center rounded-full bg-[#151411] text-center text-4xl font-black leading-none text-[#f3f0e8]">
            10%<br />OFF
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
      <div className="border border-dashed border-[#151411]/20 bg-white py-12 text-center font-semibold text-[#6a6255] dark:border-white/20 dark:bg-surface-900">
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
  kicker,
  title,
  subtitle,
  link,
}: {
  kicker: string
  title: string
  subtitle: string
  link?: string
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.26em] text-[#8b6f45]">{kicker}</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[#6a6255] dark:text-surface-300">{subtitle}</p>
      </div>
      {link && (
        <Link to={link} className="hidden shrink-0 items-center gap-2 text-sm font-black text-[#151411] transition-colors hover:text-[#8b6f45] dark:text-surface-300 sm:flex">
          View all
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}
