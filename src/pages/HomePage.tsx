import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, Headphones, Package, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { useFeaturedProducts, useNewArrivals, useBestSellers } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { ProductCard } from '@/components/shop/ProductCard'
import { Skeleton } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import type { Category, Product } from '@/types'
import toast from 'react-hot-toast'

export default function HomePage() {
  const { data: settings } = useSettings()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: featured, isLoading: featuredLoading } = useFeaturedProducts(8)
  const { data: arrivals, isLoading: arrivalsLoading } = useNewArrivals(4)
  const { data: bestSellers, isLoading: bestLoading } = useBestSellers(4)

  const products = [...(featured || []), ...(bestSellers || []), ...(arrivals || [])]
    .filter((product, index, all) => all.findIndex((item) => item.id === product.id) === index)
  const heroTitle = settings?.hero_title?.trim()
  const heroSubtitle = settings?.hero_subtitle?.trim()

  return (
    <div className="storefront-shell">
      <PromoBar />
      <Hero
        title={heroTitle && heroTitle !== 'Premium Products for Modern Living' ? heroTitle : 'Designed for the way you live.'}
        subtitle={heroSubtitle && !heroSubtitle.startsWith('Shop handpicked') ? heroSubtitle : 'Considered essentials. Remarkable quality. A simpler way to discover the things that make every day better.'}
        ctaText={settings?.hero_cta_text || 'Shop the collection'}
        ctaLink={settings?.hero_cta_link || '/shop'}
        products={products}
        loading={featuredLoading && arrivalsLoading && bestLoading}
      />
      <CategoryRail categories={(categories || []).slice(0, 6)} loading={categoriesLoading} />
      <ProductShowcase
        eyebrow="The latest"
        title="New. Noteworthy."
        description="Fresh arrivals selected for form, function, and staying power."
        products={arrivals}
        loading={arrivalsLoading}
        href="/shop?is_new_arrival=true"
      />
      <EditorialStory products={products.slice(1, 3)} />
      <ProductShowcase
        eyebrow="Customer favorites"
        title="Loved for a reason."
        description="Our most popular pieces, chosen again and again."
        products={bestSellers?.length ? bestSellers : featured}
        loading={bestLoading && featuredLoading}
        href="/shop?is_best_seller=true"
      />
      <ServiceStrip />
      <Newsletter />
    </div>
  )
}

function PromoBar() {
  return (
    <div className="bg-surface-950 text-white dark:bg-white dark:text-surface-950">
      <div className="section-container flex min-h-10 items-center justify-center gap-2 text-center text-xs font-medium tracking-wide">
        Complimentary delivery on orders over $100
        <Link to="/shop" className="inline-flex items-center underline underline-offset-4 hover:no-underline">
          Shop now <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  )
}

function Hero({ title, subtitle, ctaText, ctaLink, products, loading }: {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  products: Product[]
  loading: boolean
}) {
  const lead = products[0]
  const image = lead?.images?.find((item) => item.is_featured)?.url || lead?.images?.[0]?.url

  return (
    <section className="relative overflow-hidden bg-[#f2f2f0] dark:bg-[#151515]">
      <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_78%_30%,rgba(255,255,255,.9),transparent_38%)] dark:opacity-10" />
      <div className="section-container relative grid min-h-[680px] items-center gap-8 py-16 lg:grid-cols-[0.86fr_1.14fr] lg:py-20">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="relative z-10 max-w-2xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[.22em] text-surface-500 dark:text-surface-400">The Joe's collection</p>
          <h1 className="text-balance text-5xl font-semibold leading-[.98] tracking-[-.055em] text-surface-950 sm:text-6xl lg:text-[5.4rem] dark:text-white">{title}</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-surface-600 sm:text-xl dark:text-surface-300">{subtitle}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to={ctaLink} className="btn-primary rounded-full px-7 py-3.5">{ctaText} <ArrowRight size={17} /></Link>
            <Link to="/shop?is_best_seller=true" className="text-sm font-semibold text-surface-900 underline decoration-surface-400 underline-offset-8 transition-colors hover:text-blue-600 dark:text-white">Explore best sellers</Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, delay: .12 }} className="relative flex min-h-[420px] items-center justify-center lg:min-h-[540px]">
          {loading ? <Skeleton className="h-[480px] w-full rounded-[2.5rem]" /> : image ? (
            <Link to={`/product/${lead.slug}`} className="group relative block h-[430px] w-full overflow-hidden rounded-[2rem] sm:h-[520px]">
              <img src={image} alt={lead.name} className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.025]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7 text-white sm:p-9">
                <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-white/70">Featured</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">{lead.name}</h2></div>
                <span className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-xl">{formatCurrency(lead.sale_price ?? lead.selling_price)}</span>
              </div>
            </Link>
          ) : (
            <Link to="/shop" className="flex h-[430px] w-full items-center justify-center rounded-[2rem] bg-white/60 text-surface-400 sm:h-[520px] dark:bg-white/5"><Package size={54} /></Link>
          )}
        </motion.div>
      </div>
    </section>
  )
}

function CategoryRail({ categories, loading }: { categories: Category[]; loading: boolean }) {
  return (
    <section className="section-container py-20 sm:py-24">
      <div className="mb-10 flex items-end justify-between">
        <div><p className="eyebrow">Shop by collection</p><h2 className="section-title">Find your everyday.</h2></div>
        <Link to="/shop" className="link-arrow hidden sm:inline-flex">View all <ArrowRight size={16} /></Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[.82] rounded-[1.5rem]" />) : categories.map((category, index) => (
          <motion.div key={category.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .04 }}>
            <Link to={`/shop?category_id=${category.id}`} className="group block">
              <div className="aspect-[.86] overflow-hidden rounded-[1.5rem] bg-surface-100 dark:bg-surface-900">
                {category.image_url ? <img src={category.image_url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl font-semibold text-surface-300 dark:text-surface-700">{category.name.charAt(0)}</div>}
              </div>
              <div className="mt-4 flex items-center justify-between gap-2"><span className="text-sm font-semibold">{category.name}</span><ChevronRight size={15} className="text-surface-400 transition-transform group-hover:translate-x-1" /></div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function ProductShowcase({ eyebrow, title, description, products, loading, href }: { eyebrow: string; title: string; description: string; products?: Product[]; loading: boolean; href: string }) {
  return (
    <section className="section-container pb-24">
      <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="eyebrow">{eyebrow}</p><h2 className="section-title">{title}</h2><p className="mt-3 text-surface-500 dark:text-surface-400">{description}</p></div>
        <Link to={href} className="link-arrow">Shop all <ArrowRight size={16} /></Link>
      </div>
      {loading ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" />)}</div> : products?.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{products.slice(0, 4).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
      ) : <div className="rounded-[1.5rem] bg-surface-50 py-16 text-center text-sm text-surface-500 dark:bg-surface-900">New products are arriving soon.</div>}
    </section>
  )
}

function EditorialStory({ products }: { products: Product[] }) {
  const image = products[0]?.images?.[0]?.url
  return (
    <section className="section-container pb-24">
      <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] bg-[#1d3329] text-white">
        {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="relative flex min-h-[560px] max-w-xl flex-col justify-end p-8 sm:p-14 lg:p-16">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-white/70">Made to matter</p>
          <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">Less noise. Better things.</h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-white/75">A collection built around useful design, lasting materials, and products that earn their place in your life.</p>
          <Link to="/shop?is_featured=true" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-surface-950 transition-transform hover:scale-[1.02]">Discover the edit <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  )
}

function ServiceStrip() {
  const services = [
    { icon: Truck, title: 'Complimentary delivery', text: 'On every order over $100.' },
    { icon: RotateCcw, title: 'Easy returns', text: '30 days to change your mind.' },
    { icon: ShieldCheck, title: 'Secure by design', text: 'Protected payments and data.' },
    { icon: Headphones, title: 'Here to help', text: 'Real support when you need it.' },
  ]
  return <section className="border-y border-surface-200 dark:border-surface-800"><div className="section-container grid sm:grid-cols-2 lg:grid-cols-4">{services.map((service) => <div key={service.title} className="flex gap-4 border-b border-surface-200 py-8 sm:px-5 lg:border-b-0 lg:border-r dark:border-surface-800 first:pl-0 last:border-r-0"><service.icon size={21} strokeWidth={1.6} /><div><h3 className="text-sm font-semibold">{service.title}</h3><p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{service.text}</p></div></div>)}</div></section>
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!email) return; toast.success("You're on the list."); setEmail('') }
  return (
    <section className="section-container py-24">
      <div className="rounded-[2rem] bg-surface-950 px-7 py-14 text-center text-white sm:px-12 sm:py-20 dark:bg-white dark:text-surface-950">
        <p className="eyebrow !text-white/55 dark:!text-surface-500">Stay in the know</p><h2 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Good things, occasionally.</h2><p className="mx-auto mt-4 max-w-xl text-white/60 dark:text-surface-500">New arrivals, thoughtful stories, and offers worth opening.</p>
        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md rounded-full bg-white p-1.5 dark:bg-surface-100"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="min-w-0 flex-1 bg-transparent px-4 text-sm text-surface-950 outline-none placeholder:text-surface-400" /><button className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Subscribe</button></form>
      </div>
    </section>
  )
}
