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
    title: settings?.hero_title || 'Buy better things, without digging through noise.',
    subtitle:
      settings?.hero_subtitle ||
      'A focused shop for useful tech, everyday style, home upgrades, fitness essentials, and books worth keeping.',
    ctaText: settings?.hero_cta_text || 'Shop collection',
    ctaLink: settings?.hero_cta_link || '/shop',
  }

  const topCats = (categories || []).filter((c) => !c.parent_id).slice(0, 5)
  const heroProducts = (featured || bestSellers || arrivals || []).slice(0, 4)

  return (
    <div className="bg-[#f6f4ef] text-[#151515] dark:bg-surface-950 dark:text-white">
      <EditorialHero hero={hero} products={heroProducts} loading={featLoading && bestLoading && arrLoading} />
      <TrustBar />
      <CategoryShelf categories={topCats} loading={catLoading} />

      <ProductSection
        label="Featured"
        title="The front shelf"
        subtitle="Selected products with strong utility, clean presentation, and easy buying paths."
        link="/shop?is_featured=true"
      >
        <ProductGrid products={featured} loading={featLoading} />
      </ProductSection>

      <FeatureBand products={(bestSellers || featured || []).slice(0, 2)} />

      <ProductSection
        label="Best sellers"
        title="What people keep choosing"
        subtitle="Reliable picks with the strongest traction across the catalog."
        link="/shop?is_best_seller=true"
      >
        <ProductGrid products={bestSellers} loading={bestLoading} />
      </ProductSection>

      <ProductSection
        label="New arrivals"
        title="Fresh in the mix"
        subtitle="Recently added products, ready to scan without the clutter."
        link="/shop?is_new_arrival=true"
      >
        <ProductGrid products={arrivals} loading={arrLoading} />
      </ProductSection>

      <ReviewStrip />
      <Newsletter />
    </div>
  )
}

function EditorialHero({
  hero,
  products,
  loading,
}: {
  hero: { title: string; subtitle: string; ctaText: string; ctaLink: string }
  products: Product[]
  loading: boolean
}) {
  const primary = products[0]

  return (
    <section className="relative overflow-hidden border-b border-black/10 bg-[#efe9de] dark:border-white/10 dark:bg-surface-950">
      <div className="absolute inset-0 opacity-[0.18] dark:opacity-[0.08]">
        <div className="premium-grid h-full w-full" />
      </div>

      <div className="section-container relative grid min-h-[calc(100vh-72px)] items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black uppercase tracking-[0.28em] text-[#7b6045] dark:text-primary-300"
          >
            {SITE_NAME} curated goods
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-xl text-lg leading-8 text-[#5f5a52] dark:text-surface-300"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to={hero.ctaLink}
              className="inline-flex items-center justify-center gap-2 bg-[#151515] px-6 py-3 text-sm font-black text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-surface-950"
            >
              {hero.ctaText}
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/shop?is_new_arrival=true"
              className="inline-flex items-center justify-center gap-2 border border-black/15 bg-white/40 px-6 py-3 text-sm font-black text-[#151515] backdrop-blur transition-colors hover:bg-white/70 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              New arrivals
              <ChevronRight size={18} />
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <Skeleton className="h-[560px]" />
        ) : (
          <div className="hero-editorial-stage relative min-h-[560px]">
            <Link
              to={primary ? `/product/${primary.slug}` : '/shop'}
              className="hero-editorial-card group absolute left-0 top-8 z-20 block w-[72%] overflow-hidden bg-white shadow-2xl shadow-black/20 dark:bg-surface-900"
            >
              <ProductImage product={primary} className="aspect-[4/5]" />
              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7b6045] dark:text-primary-300">
                      Featured pick
                    </p>
                    <h2 className="mt-2 line-clamp-2 text-2xl font-black leading-tight">
                      {primary?.name || 'Explore the collection'}
                    </h2>
                  </div>
                  <div className="text-right text-lg font-black">
                    {primary ? formatCurrency(primary.sale_price ?? primary.selling_price) : ''}
                  </div>
                </div>
              </div>
            </Link>

            <div className="absolute right-0 top-0 z-10 w-[42%] space-y-4 pt-20">
              {products.slice(1, 4).map((product, index) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="mini-product-card group flex gap-3 bg-white p-3 shadow-lg shadow-black/10 dark:bg-surface-900"
                  style={{ transform: `translateX(${index % 2 === 0 ? 0 : -18}px)` }}
                >
                  <ProductImage product={product} className="h-24 w-24 shrink-0" />
                  <div className="min-w-0 py-1">
                    <div className="line-clamp-2 text-sm font-black leading-tight">{product.name}</div>
                    <div className="mt-2 text-sm font-bold text-[#7b6045] dark:text-primary-300">
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
    <div className={`relative overflow-hidden bg-[#ded7ca] dark:bg-surface-800 ${className}`}>
      {image ? (
        <img src={image} alt={product?.name || 'Product'} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#7b6045] dark:text-surface-400">
          <Box size={44} />
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),transparent_44%,rgba(0,0,0,0.12))]" />
    </div>
  )
}

function TrustBar() {
  return (
    <section className="border-b border-black/10 bg-[#151515] text-white dark:border-white/10">
      <div className="section-container grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Truck, label: 'Fast delivery', text: 'Free over $100' },
          { icon: RotateCcw, label: 'Easy returns', text: '30-day window' },
          { icon: ShieldCheck, label: 'Secure checkout', text: 'Protected payments' },
          { icon: BadgeCheck, label: 'Curated catalog', text: 'Useful picks only' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 border-b border-white/10 py-5 sm:border-r sm:px-5 lg:border-b-0 first:sm:pl-0 last:border-r-0">
            <item.icon size={22} className="text-[#d0b28a]" />
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

function CategoryShelf({ categories, loading }: { categories: any[]; loading: boolean }) {
  return (
    <section className="section-container py-16">
      <SectionHeading
        label="Departments"
        title="Shop the main shelves"
        subtitle="Direct paths into the catalog without visual noise."
        link="/shop"
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                to={`/shop?category_id=${cat.id}`}
                className="category-editorial-card group block h-52 border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-surface-900"
              >
                <div className="flex h-24 items-center justify-center bg-[#f0eadf] text-4xl font-black text-[#7b6045] transition-transform group-hover:-translate-y-1 dark:bg-surface-800 dark:text-primary-300">
                  {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" /> : cat.name[0]}
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <div className="font-black leading-tight">{cat.name}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#7b6045] dark:text-primary-300">
                      {cat.product_count || 0} items
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-surface-400 transition-transform group-hover:translate-x-1" />
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
  label,
  title,
  subtitle,
  link,
  children,
}: {
  label: string
  title: string
  subtitle: string
  link: string
  children: React.ReactNode
}) {
  return (
    <section className="section-container py-14">
      <SectionHeading label={label} title={title} subtitle={subtitle} link={link} />
      {children}
    </section>
  )
}

function FeatureBand({ products }: { products: Product[] }) {
  const first = products[0]
  const second = products[1]

  return (
    <section className="bg-[#151515] text-white">
      <div className="section-container grid gap-10 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d0b28a]">Seasonal edit</p>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            A store should feel considered, not generated.
          </h2>
          <p className="mt-5 max-w-xl leading-8 text-surface-300">
            Clean product hierarchy, useful contrast, and small motion details that support shopping instead of shouting over it.
          </p>
          <Link to="/shop" className="mt-8 inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-black text-[#151515] transition-transform hover:-translate-y-0.5">
            Browse all
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="feature-stack relative min-h-[440px]">
          {[first, second].filter(Boolean).map((product, index) => (
            <Link
              key={product!.id}
              to={`/product/${product!.slug}`}
              className={`feature-stack-card group absolute overflow-hidden bg-white text-[#151515] shadow-2xl shadow-black/30 ${
                index === 0 ? 'left-0 top-0 z-20 w-[58%]' : 'bottom-0 right-0 z-10 w-[54%]'
              }`}
            >
              <ProductImage product={product} className="aspect-[4/5]" />
              <div className="p-4">
                <div className="line-clamp-2 font-black">{product!.name}</div>
                <div className="mt-2 text-sm font-bold text-[#7b6045]">
                  {formatCurrency(product!.sale_price ?? product!.selling_price)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReviewStrip() {
  return (
    <section className="section-container py-16">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ['A cleaner catalog', 'The layout feels much closer to a real store. Products are the focus.'],
          ['Good motion', 'The depth is subtle and useful instead of fighting the page.'],
          ['Easy to scan', 'The sections make sense and the store feels more trustworthy.'],
        ].map(([title, text], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-surface-900"
          >
            <Quote className="mb-5 text-[#7b6045] dark:text-primary-300" size={28} />
            <h3 className="font-black">{title}</h3>
            <p className="mt-3 leading-7 text-surface-600 dark:text-surface-300">"{text}"</p>
            <div className="mt-5 flex text-warning-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
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
      <div className="grid border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-surface-900 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-8 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#7b6045] dark:text-primary-300">Newsletter</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Get the better drops first.</h2>
          <p className="mt-3 max-w-xl leading-7 text-surface-600 dark:text-surface-300">
            New products, clean deals, and a first-order code when the next edit lands.
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
            <button type="submit" className="bg-[#151515] px-6 py-3 text-sm font-black text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-surface-950">
              Join list
            </button>
          </form>
        </div>
        <div className="flex items-center justify-center border-t border-black/10 bg-[#efe9de] p-8 dark:border-white/10 dark:bg-surface-950 lg:border-l lg:border-t-0">
          <div className="newsletter-monogram flex h-40 w-40 items-center justify-center bg-[#151515] text-center text-4xl font-black leading-none text-white shadow-2xl shadow-black/20 dark:bg-white dark:text-surface-950">
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
      <div className="border border-dashed border-black/20 bg-white py-12 text-center font-semibold text-surface-500 dark:border-white/20 dark:bg-surface-900">
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
  label,
  title,
  subtitle,
  link,
}: {
  label: string
  title: string
  subtitle: string
  link?: string
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#7b6045] dark:text-primary-300">{label}</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-surface-600 dark:text-surface-300">{subtitle}</p>
      </div>
      {link && (
        <Link to={link} className="hidden shrink-0 items-center gap-2 text-sm font-black text-[#151515] transition-colors hover:text-[#7b6045] dark:text-surface-300 dark:hover:text-primary-300 sm:flex">
          View all
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}
