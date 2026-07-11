import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Headphones,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
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

const accent = 'text-blue-600 dark:text-blue-400'

export default function HomePage() {
  const { data: settings } = useSettings()
  const { data: categories, isLoading: catLoading } = useCategories()
  const { data: featured, isLoading: featLoading } = useFeaturedProducts(8)
  const { data: arrivals, isLoading: arrLoading } = useNewArrivals(4)
  const { data: bestSellers, isLoading: bestLoading } = useBestSellers(4)

  const configuredTitle = settings?.hero_title?.trim()
  const configuredSubtitle = settings?.hero_subtitle?.trim()
  const hero = {
    title:
      configuredTitle && configuredTitle !== 'Premium Products for Modern Living'
        ? configuredTitle
        : 'Good products. Clear choices.',
    subtitle:
      configuredSubtitle && configuredSubtitle !== "Shop handpicked essentials from the world's best brands. Fast shipping, easy returns."
        ? configuredSubtitle
        : 'Useful finds across tech, home, style, fitness, and more. Easy to browse, easy to buy.',
    ctaText: settings?.hero_cta_text || 'Shop all products',
    ctaLink: settings?.hero_cta_link || '/shop',
  }

  const topCategories = (categories || []).filter((category) => !category.parent_id).slice(0, 6)
  const heroProducts = [...(featured || []), ...(bestSellers || []), ...(arrivals || [])]
    .filter((product, index, list) => list.findIndex((item) => item.id === product.id) === index)
    .slice(0, 3)

  return (
    <div className="bg-white text-surface-900 dark:bg-surface-950 dark:text-white">
      <Announcement />
      <Hero hero={hero} products={heroProducts} loading={featLoading && bestLoading && arrLoading} />
      <CategoryStrip categories={topCategories} loading={catLoading} />

      <ProductSection
        label="Featured"
        title="Popular right now"
        description="Customer favorites and standout picks from across the store."
        link="/shop?is_featured=true"
      >
        <ProductGrid products={featured} loading={featLoading} />
      </ProductSection>

      <PromoPanel products={(bestSellers || featured || []).slice(0, 2)} />

      <ProductSection
        label="Best sellers"
        title="Tried, tested, and selling fast"
        description="The products people keep coming back for."
        link="/shop?is_best_seller=true"
      >
        <ProductGrid products={bestSellers} loading={bestLoading} />
      </ProductSection>

      <Benefits />

      <ProductSection
        label="Just in"
        title="New this week"
        description="A fresh selection of recently added products."
        link="/shop?is_new_arrival=true"
      >
        <ProductGrid products={arrivals} loading={arrLoading} />
      </ProductSection>

      <Newsletter />
    </div>
  )
}

function Announcement() {
  return (
    <div className="border-b border-blue-100 bg-blue-50 text-blue-950 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100">
      <div className="section-container flex min-h-9 items-center justify-center gap-2 py-2 text-center text-xs font-semibold sm:text-sm">
        <Truck size={15} />
        Free shipping on orders over $100
        <span className="hidden text-blue-300 sm:inline">|</span>
        <Link to="/shop" className="hidden items-center gap-1 hover:text-blue-600 sm:inline-flex dark:hover:text-blue-300">
          Shop now <ChevronRight size={14} />
        </Link>
      </div>
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
  const mainProduct = products[0]

  return (
    <section className="border-b border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900/40">
      <div className="section-container grid items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-800 dark:bg-surface-900 dark:text-blue-300"
          >
            <Sparkles size={14} />
            New picks added every week
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-surface-950 sm:text-5xl lg:text-6xl dark:text-white"
          >
            {hero.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-5 max-w-lg text-base leading-7 text-surface-600 sm:text-lg dark:text-surface-300"
          >
            {hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-7 flex flex-col gap-3 sm:flex-row"
          >
            <Link to={hero.ctaLink} className="btn-primary">
              {hero.ctaText}
              <ArrowRight size={17} />
            </Link>
            <Link to="/categories" className="btn-secondary">
              Browse categories
            </Link>
          </motion.div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-surface-500 dark:text-surface-400">
            <span className="inline-flex items-center gap-1.5"><BadgeCheck size={16} className="text-emerald-500" /> Quality checked</span>
            <span className="inline-flex items-center gap-1.5"><RotateCcw size={16} className="text-emerald-500" /> 30-day returns</span>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-[480px] rounded-lg" />
        ) : (
          <div className="grid min-w-0 gap-3 sm:min-h-[420px] sm:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] sm:gap-4">
            <Link
              to={mainProduct ? `/product/${mainProduct.slug}` : '/shop'}
              className="group relative min-w-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-surface-200 dark:bg-surface-900 dark:ring-surface-800"
            >
              <ProductImage product={mainProduct} className="h-full min-h-[340px] sm:min-h-[420px]" />
              <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:bg-surface-950/90">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Featured pick</p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <h2 className="line-clamp-2 font-semibold leading-snug">{mainProduct?.name || 'Explore all products'}</h2>
                  {mainProduct && (
                    <span className="shrink-0 text-sm font-bold">
                      {formatCurrency(mainProduct.sale_price ?? mainProduct.selling_price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-4">
              {products.slice(1, 3).map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group min-w-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-surface-200 transition-shadow hover:shadow-md dark:bg-surface-900 dark:ring-surface-800"
                >
                  <ProductImage product={product} className="aspect-square" />
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
                    <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(product.sale_price ?? product.selling_price)}
                    </p>
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
  const image = product?.images?.find((item) => item.is_featured)?.url || product?.images?.[0]?.url

  return (
    <div className={`relative overflow-hidden bg-surface-100 dark:bg-surface-800 ${className}`}>
      {image ? (
        <img
          src={image}
          alt={product?.name || 'Product'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-surface-400">
          <Package size={42} />
        </div>
      )}
    </div>
  )
}

function CategoryStrip({ categories, loading }: { categories: any[]; loading: boolean }) {
  return (
    <section className="section-container py-12">
      <SectionHeading
        label="Categories"
        title="Find what you need"
        description="Jump straight into the department you want."
        link="/categories"
      />
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.035 }}
            >
              <Link
                to={`/shop?category_id=${category.id}`}
                className="group flex h-32 flex-col justify-between rounded-lg border border-surface-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-surface-800 dark:bg-surface-900 dark:hover:border-blue-800"
              >
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-blue-50 text-lg font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                  {category.image_url ? <img src={category.image_url} alt="" className="h-full w-full object-cover" /> : category.name[0]}
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <div className="line-clamp-1 text-sm font-semibold">{category.name}</div>
                    <div className="mt-0.5 text-xs text-surface-400">{category.product_count || 0} items</div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-surface-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

function ProductSection({ label, title, description, link, children }: {
  label: string
  title: string
  description: string
  link: string
  children: React.ReactNode
}) {
  return (
    <section className="section-container py-12">
      <SectionHeading label={label} title={title} description={description} link={link} />
      {children}
    </section>
  )
}

function PromoPanel({ products }: { products: Product[] }) {
  return (
    <section className="section-container py-6">
      <div className="grid overflow-hidden rounded-lg bg-blue-600 text-white lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          <p className="text-sm font-semibold text-blue-100">Smart picks, better prices</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Small upgrades that make a difference.</h2>
          <p className="mt-4 max-w-lg leading-7 text-blue-100">
            Browse everyday products chosen for usefulness, quality, and value.
          </p>
          <Link to="/shop" className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50">
            Explore the collection <ArrowRight size={17} />
          </Link>
        </div>
        <div className="grid min-h-64 grid-cols-2 gap-px bg-blue-500">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.slug}`} className="group relative min-h-64 overflow-hidden bg-surface-100">
              <ProductImage product={product} className="h-full" />
              <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white/95 p-3 text-surface-900 shadow-sm backdrop-blur-sm">
                <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
                <p className="mt-1 text-sm font-bold text-blue-600">{formatCurrency(product.sale_price ?? product.selling_price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function Benefits() {
  const benefits = [
    { icon: Truck, title: 'Fast delivery', text: 'Clear tracking from checkout to your door.' },
    { icon: RotateCcw, title: 'Easy returns', text: 'A simple 30-day return window.' },
    { icon: ShieldCheck, title: 'Secure checkout', text: 'Your payment details stay protected.' },
    { icon: Headphones, title: 'Helpful support', text: 'Real help whenever you need it.' },
  ]

  return (
    <section className="border-y border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900/50">
      <div className="section-container grid sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="flex gap-3 border-b border-surface-200 py-7 sm:px-5 lg:border-b-0 lg:border-r dark:border-surface-800 first:sm:pl-0 last:border-r-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-surface-200 dark:bg-surface-900 dark:text-blue-400 dark:ring-surface-800">
              <benefit.icon size={19} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{benefit.title}</h3>
              <p className="mt-1 text-sm leading-6 text-surface-500 dark:text-surface-400">{benefit.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Newsletter() {
  const [email, setEmail] = useState('')

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email) return
    toast.success('You are on the list.')
    setEmail('')
  }

  return (
    <section className="section-container py-14">
      <div className="flex flex-col gap-7 rounded-lg border border-surface-200 bg-surface-50 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between dark:border-surface-800 dark:bg-surface-900">
        <div>
          <p className={`text-sm font-semibold ${accent}`}>Stay in the loop</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">New products and worthwhile deals.</h2>
          <p className="mt-2 text-surface-500 dark:text-surface-400">A useful email now and then. No clutter.</p>
        </div>
        <form onSubmit={submit} className="flex w-full max-w-lg flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary shrink-0">Join the list</button>
        </form>
      </div>
    </section>
  )
}

function ProductGrid({ products, loading }: { products: Product[] | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} variant="card" />)}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-surface-300 bg-surface-50 py-12 text-center text-sm font-medium text-surface-500 dark:border-surface-700 dark:bg-surface-900">
        No products available yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
    </div>
  )
}

function SectionHeading({ label, title, description, link }: {
  label: string
  title: string
  description: string
  link?: string
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5">
      <div>
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{label}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-surface-500 sm:text-base dark:text-surface-400">{description}</p>
      </div>
      {link && (
        <Link to={link} className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 sm:flex dark:text-blue-400 dark:hover:text-blue-300">
          View all <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}
