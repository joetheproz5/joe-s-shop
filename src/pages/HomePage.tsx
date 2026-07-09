import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Sparkles, TrendingUp, Star, Truck, ShieldCheck, RotateCcw,
  Facebook, Twitter, Instagram, Youtube, Quote,
} from 'lucide-react'
import { useFeaturedProducts, useNewArrivals, useBestSellers } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { ProductCard } from '@/components/shop/ProductCard'
import { Skeleton } from '@/components/ui'
import { clsx } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function HomePage() {
  const { data: settings } = useSettings()
  const { data: categories, isLoading: catLoading } = useCategories()
  const { data: featured, isLoading: featLoading } = useFeaturedProducts(8)
  const { data: arrivals, isLoading: arrLoading } = useNewArrivals(4)
  const { data: bestSellers, isLoading: bestLoading } = useBestSellers(4)

  const hero = {
    title: settings?.hero_title || 'Premium Products for Modern Living',
    subtitle: settings?.hero_subtitle || 'Shop handpicked essentials from the world\'s best brands.',
    ctaText: settings?.hero_cta_text || 'Shop Now',
    ctaLink: settings?.hero_cta_link || '/shop',
  }

  const topCats = (categories || []).filter((c) => !c.parent_id).slice(0, 5)

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute top-10 left-1/4 w-72 h-72 bg-primary-300 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute bottom-10 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 section-container py-20 lg:py-32 text-center max-w-4xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sm font-medium mb-6"
          >
            <Sparkles size={14} /> Welcome to {SITE_NAME}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-balance"
          >
            {hero.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg lg:text-xl text-primary-100 max-w-2xl mx-auto"
          >
            {hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to={hero.ctaLink}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 font-semibold shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              {hero.ctaText} <ArrowRight size={18} />
            </Link>
            <Link
              to="/shop?is_new_arrival=true"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold border border-white/20 hover:bg-white/20 transition-all"
            >
              Explore New Arrivals
            </Link>
          </motion.div>
        </div>

        {/* Trust badges */}
        <div className="relative z-10 border-t border-white/10">
          <div className="section-container py-5 grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            {[
              { icon: Truck, label: 'Free shipping over $100' },
              { icon: RotateCcw, label: '30-day returns' },
              { icon: ShieldCheck, label: 'Secure checkout' },
              { icon: Star, label: 'Top-rated products' },
            ].map((b) => (
              <div key={b.label} className="flex items-center justify-center gap-2 text-primary-100">
                <b.icon size={18} /> {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <Section title="Shop by Category" subtitle="Find exactly what you're looking for" link="/shop">
        {catLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="aspect-[4/5]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topCats.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link
                  to={`/shop?category_id=${cat.id}`}
                  className="card overflow-hidden group block text-center"
                >
                  <div className="aspect-[4/5] bg-gradient-to-br from-primary-100 to-primary-50 dark:from-surface-800 dark:to-surface-900 flex items-center justify-center overflow-hidden">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-5xl font-bold text-primary-300 dark:text-primary-800 group-hover:scale-110 transition-transform">
                        {cat.name[0]}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-semibold">{cat.name}</div>
                    <div className="text-xs text-surface-500 mt-0.5">{cat.product_count || 0} items</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* ===== FEATURED ===== */}
      <Section title="Featured Products" subtitle="Our handpicked favorites" link="/shop?is_featured=true" icon={<Sparkles size={20} />}>
        <ProductGrid products={featured} loading={featLoading} />
      </Section>

      {/* ===== PROMO BANNER ===== */}
      <div className="section-container py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-900 to-primary-900 text-white p-8 lg:p-14"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/30 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
              <TrendingUp size={14} /> Limited Time
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Up to 40% off tech essentials</h2>
            <p className="text-primary-100 mb-6">Upgrade your gear with our biggest sale of the season. Stock is limited — shop before it's gone.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-surface-900 font-semibold hover:scale-105 transition-transform">
              Shop the Sale <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ===== BEST SELLERS ===== */}
      <Section title="Best Sellers" subtitle="Loved by thousands of customers" link="/shop?is_best_seller=true" icon={<TrendingUp size={20} />}>
        <ProductGrid products={bestSellers} loading={bestLoading} />
      </Section>

      {/* ===== NEW ARRIVALS ===== */}
      <Section title="New Arrivals" subtitle="Fresh drops every week" link="/shop?is_new_arrival=true">
        <ProductGrid products={arrivals} loading={arrLoading} />
      </Section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section-container py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">What Our Customers Say</h2>
          <p className="text-surface-500 mt-2">Real reviews from real shoppers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah K.', role: 'Verified Buyer', text: 'Absolutely love the quality and fast shipping. Joe\'s Shop has become my go-to for everything.', rating: 5 },
            { name: 'Mike R.', role: 'Verified Buyer', text: 'Best online shopping experience I\'ve had. The product exceeded my expectations.', rating: 5 },
            { name: 'Emily L.', role: 'Verified Buyer', text: 'Customer service was incredible when I had a question. Will definitely shop here again.', rating: 5 },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <Quote className="text-primary-200 dark:text-primary-800 mb-4" size={32} />
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} className="text-warning-500" fill="currentColor" />
                ))}
              </div>
              <p className="text-surface-700 dark:text-surface-300 mb-5 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center font-semibold">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-surface-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="section-container pb-16">
        <Newsletter />
      </section>
    </div>
  )
}

function Section({ title, subtitle, link, icon, children }: {
  title: string
  subtitle?: string
  link?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="section-container py-12">
      <div className="flex items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            {icon} {title}
          </h2>
          {subtitle && <p className="text-surface-500 mt-1">{subtitle}</p>}
        </div>
        {link && (
          <Link to={link} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 whitespace-nowrap">
            View all <ArrowRight size={16} />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function ProductGrid({ products, loading }: { products: any[] | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" />)}
      </div>
    )
  }
  if (!products || products.length === 0) {
    return <p className="text-surface-500 text-center py-8">No products available.</p>
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
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
    <div className="card overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div className="p-8 lg:p-12 bg-gradient-to-br from-primary-50 to-white dark:from-surface-800 dark:to-surface-900">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">Join our newsletter</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            Subscribe to get the latest products, exclusive deals, and a 10% off welcome coupon.
          </p>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">Subscribe</button>
          </form>
          <p className="text-xs text-surface-400 mt-3">By subscribing you agree to our Privacy Policy.</p>
        </div>
        <div className="hidden lg:flex items-center justify-center p-12 bg-primary-600 text-white">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">10%</div>
            <div className="text-primary-100">Off your first order</div>
          </div>
        </div>
      </div>
    </div>
  )
}
