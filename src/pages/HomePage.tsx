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
    title: settings?.hero_title || 'Everyday goods, edited with taste.',
    subtitle:
      settings?.hero_subtitle ||
      'A calm, curated shop for useful tech, style, home, fitness, and reading essentials.',
    ctaText: settings?.hero_cta_text || 'Shop now',
    ctaLink: settings?.hero_cta_link || '/shop',
  }

  const topCats = (categories || []).filter((c) => !c.parent_id).slice(0, 5)
  const heroProducts = [...(featured || []), ...(bestSellers || []), ...(arrivals || [])]
    .filter((product, index, list) => list.findIndex((p) => p.id === product.id) === index)
    .slice(0, 3)

  return (
    <div className="bg-[#fbfaf7] text-[#191815] dark:bg-surface-950 dark:text-white">
      <Hero hero={hero} products={heroProducts} loading={featLoading && bestLoading && arrLoading} />
      <ServiceBar />
      <Categories categories={topCats} loading={catLoading} />

      <ProductSection
        eyebrow="Featured"
        title="The current edit"
        subtitle="Handpicked products with clean details and easy decisions."
        link="/shop?is_featured=true"
      >
        <ProductGrid products={featured} loading={featLoading} />
      </ProductSection>

      <EditorialBand products={(bestSellers || featured || []).slice(0, 2)} />

      <ProductSection
        eyebrow="Best sellers"
        title="What customers choose most"
        subtitle="Reliable picks from across the store."
        link="/shop?is_best_seller=true"
      >
        <ProductGrid products={bestSellers} loading={bestLoading} />
      </ProductSection>

      <ProductSection
        eyebrow="New arrivals"
        title="Freshly added"
        subtitle="New products, simply presented."
        link="/shop?is_new_arrival=true"
      >
        <ProductGrid products={arrivals} loading={arrLoading} />
      </ProductSection>

      <Reviews />
      <Newsletter />
    </div>
  )
}

function Hero({
  hero,
  products,
  loading,
}: {
  hero: { title: string; subtitle: string; ctaText: string; ctaLink: string }
  products: Product[]
  loading: boolean
}) {
  const main = products[0]

  return (
    <section className="border-b border-[#191815]/10 bg-[#f1eadf] dark:border-white/10 dark:bg-[#111318]">
      <div className="section-container grid min-h-[calc(100vh-72px)] items-center gap-12 py-16 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black uppercase tracking-[0.26em] text-[#8d6f43] dark:text-primary-300"
          >
            {SITE_NAME} collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 max-w-3xl text-5xl font-black leading-[0.96] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {hero.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-xl text-lg leading-8 text-[#6c6254] dark:text-surface-300"
          >
            {hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to={hero.ctaLink}
              className="inline-flex items-center justify-center gap-2 bg-[#191815] px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#3a3329] dark:bg-white dark:text-surface-950"
            >
              {hero.ctaText}
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/shop?is_new_arrival=true"
              className="inline-flex items-center justify-center gap-2 border border-[#191815]/15 bg-white/50 px-6 py-3 text-sm font-black text-[#191815] transition-colors hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              View new arrivals
              <ChevronRight size={18} />
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <Skeleton className="h-[560px]" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Link
              to={main ? `/product/${main.slug}` : '/shop'}
              className="group block overflow-hidden bg-white shadow-sm ring-1 ring-[#191815]/10 dark:bg-surface-900 dark:ring-white/10"
            >
              <ProductImage product={main} className="aspect-[4/5]" />
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8d6f43]">Featured pick</p>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <h2 className="line-clamp-2 text-2xl font-black leading-tight">{main?.name || 'Explore the collection'}</h2>
                  {main && <span className="shrink-0 font-black">{formatCurrency(main.sale_price ?? main.selling_price)}</span>}
                </div>
              </div>
            </Link>

            <div className="grid gap-4">
              {products.slice(1, 3).map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group flex gap-3 bg-white p-3 shadow-sm ring-1 ring-[#191815]/10 transition-colors hover:bg-[#fffdf8] dark:bg-surface-900 dark:ring-white/10"
                >
                  <ProductImage product={product} className="h-28 w-28 shrink-0" />
                  <div className="min-w-0 py-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d6f43]">Selected</p>
                    <h3 className="mt-2 line-clamp-2 font-black leading-tight">{product.name}</h3>
                    <div className="mt-2 text-sm font-bold text-[#6c6254] dark:text-surface-300">
                      {formatCurrency(product.sale_price ?? product.selling_price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function ProductImage({ product, className }: { product?: Product; className: string }) {
  const image = product?.images?.find((img) => img.is_featured)?.url || product?.images?.[0]?.url

  return (
    <div className={`relative overflow-hidden bg-[#e7dfd1] dark:bg-surface-800 ${className}`}>
      {image ? (
        <img src={image} alt={product?.name || 'Product'} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#8d6f43] dark:text-surface-400">
          <Box size={44} />
        </div>
      )}
    </div>
  )
}

function ServiceBar() {
  return (
    <section className="border-b border-[#191815]/10 bg-[#191815] text-white dark:border-white/10">
      <div className="section-container grid sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Truck, label: 'Fast shipping', text: 'Free over $100' },
          { icon: RotateCcw, label: 'Easy returns', text: '30-day window' },
          { icon: ShieldCheck, label: 'Secure checkout', text: 'Protected payments' },
          { icon: BadgeCheck, label: 'Curated catalog', text: 'Picked with care' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 border-b border-white/10 py-5 sm:border-r sm:px-5 lg:border-b-0 first:sm:pl-0 last:border-r-0">
            <item.icon size={20} className="text-[#d7c29a]" />
            <div>
              <div className="font-black">{item.label}</div>
              <div className="text-sm text-surface-400">{item.text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Categories({ categories, loading }: { categories: any[]; loading: boolean }) {
  return (
    <section className="section-container py-16">
      <SectionHeading
        eyebrow="Departments"
        title="Shop by category"
        subtitle="Simple paths into the products you actually want."
        link="/shop"
      />
      {loading ? (
        <div className="grid gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                to={`/shop?category_id=${cat.id}`}
                className="group block h-44 bg-white p-4 shadow-sm ring-1 ring-[#191815]/10 transition-colors hover:bg-[#fffdf8] dark:bg-surface-900 dark:ring-white/10"
              >
                <div className="flex h-20 items-center justify-center bg-[#f1eadf] text-4xl font-black text-[#8d6f43] dark:bg-surface-800">
                  {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" /> : cat.name[0]}
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <div className="font-black leading-tight">{cat.name}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#8d6f43]">{cat.product_count || 0} items</div>
                  </div>
                  <ArrowRight size={18} className="text-[#8a806f] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

function ProductSection({ eyebrow, title, subtitle, link, children }: {
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

function EditorialBand({ products }: { products: Product[] }) {
  return (
    <section className="bg-[#191815] text-white">
      <div className="section-container grid gap-10 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#d7c29a]">Aesthetic, not loud</p>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            A storefront should make products feel easy to trust.
          </h2>
          <p className="mt-5 max-w-xl leading-8 text-surface-300">
            Quiet contrast, clear sections, and product imagery doing the heavy lifting.
          </p>
          <Link to="/shop" className="mt-8 inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-black text-[#191815]">
            Browse all
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.slug}`} className="group overflow-hidden bg-[#f1eadf] text-[#191815]">
              <ProductImage product={product} className="aspect-[4/5]" />
              <div className="p-4">
                <h3 className="line-clamp-2 font-black leading-tight">{product.name}</h3>
                <div className="mt-2 text-sm font-black text-[#8d6f43]">
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

function Reviews() {
  return (
    <section className="section-container py-16">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ['Clean shopping', 'No noise. Just products, prices, and categories that are easy to read.'],
          ['Looks trustworthy', 'The layout feels closer to a real store and less like a generated landing page.'],
          ['Easy to browse', 'Everything is calm enough to scan quickly.'],
        ].map(([title, text], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-6 shadow-sm ring-1 ring-[#191815]/10 dark:bg-surface-900 dark:ring-white/10"
          >
            <Quote className="mb-5 text-[#8d6f43]" size={26} />
            <h3 className="font-black">{title}</h3>
            <p className="mt-3 leading-7 text-[#6c6254] dark:text-surface-300">"{text}"</p>
            <div className="mt-5 flex text-warning-500">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
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
      <div className="grid bg-white shadow-sm ring-1 ring-[#191815]/10 dark:bg-surface-900 dark:ring-white/10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-8 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#8d6f43]">Newsletter</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Get new edits first.</h2>
          <p className="mt-3 max-w-xl leading-7 text-[#6c6254] dark:text-surface-300">
            Fresh products, clean deals, and useful updates.
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
            <button type="submit" className="bg-[#191815] px-6 py-3 text-sm font-black text-white dark:bg-white dark:text-surface-950">
              Join list
            </button>
          </form>
        </div>
        <div className="flex items-center justify-center border-t border-[#191815]/10 bg-[#f1eadf] p-8 dark:border-white/10 dark:bg-surface-950 lg:border-l lg:border-t-0">
          <div className="flex h-40 w-40 items-center justify-center rounded-full bg-[#191815] text-center text-4xl font-black leading-none text-white">
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
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" />)}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="border border-dashed border-[#191815]/20 bg-white py-12 text-center font-semibold text-[#6c6254] dark:border-white/20 dark:bg-surface-900">
        No products available yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  )
}

function SectionHeading({ eyebrow, title, subtitle, link }: {
  eyebrow: string
  title: string
  subtitle: string
  link?: string
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.26em] text-[#8d6f43]">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[#6c6254] dark:text-surface-300">{subtitle}</p>
      </div>
      {link && (
        <Link to={link} className="hidden shrink-0 items-center gap-2 text-sm font-black text-[#191815] hover:text-[#8d6f43] dark:text-surface-300 sm:flex">
          View all
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}
