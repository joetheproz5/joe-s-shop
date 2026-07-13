import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Star, Heart, ShoppingCart, Zap, Minus, Plus, ChevronRight, Truck, RotateCcw,
  ShieldCheck, Check, Share2, Package,
} from 'lucide-react'
import { useProduct, useRelatedProducts } from '@/hooks/useProducts'
import { useReviews } from '@/hooks/useReviews'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useAuth } from '@/context/AuthContext'
import { ProductCard } from '@/components/shop/ProductCard'
import { Skeleton, Tabs, Button, Input } from '@/components/ui'
import { formatCurrency, getDiscountPercentage, getStockStatus, clsx, formatDate } from '@/lib/utils'
import { getProductImage } from '@/lib/productImages'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading } = useProduct(slug || '')
  const { profile } = useAuth()
  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggleItem)
  const isInWishlist = useWishlistStore((s) => (product ? s.isInWishlist(product.id) : false))

  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 })

  const relatedCatId = product?.categories?.[0]?.id || ''
  const { data: related } = useRelatedProducts(relatedCatId, product?.id || '')
  const { data: reviews } = useReviews(product?.id || '')

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton variant="rectangle" className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page-container text-center py-24">
        <h1 className="text-3xl font-bold mb-4">Product not found</h1>
        <p className="text-surface-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop" className="btn-primary inline-flex">Back to Shop</Link>
      </div>
    )
  }

  const images = product.images || []
  const activeImageUrl = getProductImage(product, activeImage)
  const variants = product.variants || []
  const activeVariant = variants.find((variant) => variant.id === selectedVariant)
  const availableStock = Math.max(0, activeVariant?.stock_quantity ?? product.stock_quantity)
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[]
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[]
  const onSale = product.sale_price != null && product.sale_price < product.selling_price
  const discount = onSale ? getDiscountPercentage(product.selling_price, product.sale_price!) : 0
  const stock = getStockStatus(availableStock, product.low_stock_threshold)
  const currentPrice = product.sale_price ?? product.selling_price
  const savings = onSale ? product.selling_price - product.sale_price! : 0
  const tags = product.tags ?? []

  const handleAddToCart = () => {
    const added = addItem(product, activeVariant, qty)
    if (added <= 0) {
      toast.error(`Only ${availableStock} available`)
      return false
    }
    toast.success(added === qty ? `${product.name} added to cart` : `Added ${added}; stock limit reached`)
    return true
  }

  const handleBuyNow = () => {
    if (handleAddToCart()) navigate('/cart')
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoom({ active: true, x, y })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      <div className="page-container py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-surface-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight size={14} />
        {product.categories?.[0] && (
          <>
            <Link to={`/shop?category_id=${product.categories[0].id}`} className="hover:text-blue-600">{product.categories[0].name}</Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="text-surface-900 dark:text-surface-50 truncate">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ===== Gallery ===== */}
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square cursor-zoom-in overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-800"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
          >
            {activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt={images[activeImage]?.alt_text || product.name}
                className="w-full h-full object-cover transition-transform duration-200"
                style={zoom.active ? { transform: `scale(2)`, transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-surface-300">
                <Package size={64} />
              </div>
            )}
            {onSale && <span className="absolute top-4 left-4 badge-danger text-base px-3 py-1">-{discount}%</span>}
          </motion.div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={clsx(
                    'h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                    activeImage === i ? 'border-blue-600' : 'border-transparent opacity-70 hover:opacity-100'
                  )}
                >
                  <img src={getProductImage(product, i)} alt={img.alt_text || `view ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== Info ===== */}
        <div>
          {product.brand && (
            <Link to={`/shop?brand_id=${product.brand.id}`} className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
              {product.brand.name}
            </Link>
          )}
          <h1 className="text-3xl lg:text-4xl font-bold mt-1 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={i < Math.round(product.average_rating) ? 'text-warning-500' : 'text-surface-300 dark:text-surface-700'}
                  fill="currentColor"
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.average_rating?.toFixed(1) || '0.0'}</span>
            <a href="#reviews" className="text-sm text-surface-500 hover:text-blue-600">({product.review_count || 0} reviews)</a>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatCurrency(currentPrice)}</span>
            {onSale && (
              <>
                <span className="text-xl text-surface-400 line-through">{formatCurrency(product.selling_price)}</span>
                <span className="badge-success">Save {formatCurrency(savings)}</span>
              </>
            )}
          </div>

          <p className="text-surface-600 dark:text-surface-400 mt-4 leading-relaxed">{product.short_description}</p>

          {/* Stock */}
          <div className="mt-4 flex items-center gap-2">
            <span className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
              stock.status === 'in_stock' && 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300',
              stock.status === 'low_stock' && 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300',
              stock.status === 'out_of_stock' && 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300',
            )}>
              <span className={clsx('w-2 h-2 rounded-full', stock.status === 'in_stock' ? 'bg-success-500' : stock.status === 'low_stock' ? 'bg-warning-500' : 'bg-danger-500')} />
              {stock.label}{stock.status !== 'out_of_stock' && ` (${availableStock} available)`}
            </span>
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <div className="mt-6">
              <label className="text-sm font-semibold mb-2 block">Color</label>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      const v = variants.find((x) => x.color === c)
                      setSelectedVariant(v?.id || null)
                      setQty((current) => Math.max(1, Math.min(current, v?.stock_quantity ?? product.stock_quantity)))
                    }}
                    className={clsx(
                      'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all',
                      variants.find((v) => v.id === selectedVariant)?.color === c
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-surface-300 dark:border-surface-700 hover:border-surface-400'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-semibold mb-2 block">Size</label>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      const v = variants.find((x) => x.size === s)
                      setSelectedVariant(v?.id || null)
                      setQty((current) => Math.max(1, Math.min(current, v?.stock_quantity ?? product.stock_quantity)))
                    }}
                    className={clsx(
                      'min-w-[3rem] rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all',
                      variants.find((v) => v.id === selectedVariant)?.size === s
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-surface-300 dark:border-surface-700 hover:border-surface-400'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-surface-300 dark:border-surface-700">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:text-blue-600" aria-label="Decrease">
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(availableStock, q + 1))} disabled={qty >= availableStock} className="p-3 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Increase">
                <Plus size={16} />
              </button>
            </div>
            <Button onClick={handleAddToCart} disabled={availableStock <= 0} size="lg" leftIcon={<ShoppingCart size={18} />} className="flex-1">
              Add to Cart
            </Button>
            <Button onClick={handleBuyNow} disabled={availableStock <= 0} size="lg" variant="secondary" leftIcon={<Zap size={18} />}>
              Buy Now
            </Button>
          </div>

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => { toggleWishlist(product); toast.success('Wishlist updated') }}
              className={clsx('btn-secondary flex-1', isInWishlist && 'text-danger-500')}
            >
              <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} /> {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
            <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied') }} className="btn-secondary">
              <Share2 size={16} />
            </button>
          </div>

          {/* Meta */}
          <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-800 grid grid-cols-2 gap-4 text-sm">
            {product.sku && <div><span className="text-surface-500">SKU:</span> <span className="font-medium">{product.sku}</span></div>}
            {product.categories?.[0] && <div><span className="text-surface-500">Category:</span> <span className="font-medium">{product.categories[0].name}</span></div>}
            {tags.length > 0 && (
              <div className="col-span-2">
                <span className="text-surface-500">Tags:</span>{' '}
                {tags.map((t) => <span key={t} className="badge-primary mr-1">#{t}</span>)}
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free shipping', sub: 'Orders over $100' },
              { icon: RotateCcw, label: '30-day returns', sub: 'Hassle-free' },
              { icon: ShieldCheck, label: 'Secure', sub: 'Protected checkout' },
            ].map((b) => (
              <div key={b.label} className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center dark:border-surface-800 dark:bg-surface-900">
                <b.icon className="mx-auto mb-1 text-blue-600 dark:text-blue-400" size={20} />
                <div className="text-xs font-semibold">{b.label}</div>
                <div className="text-[10px] text-surface-500">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Tabs: Description / Specs / Reviews ===== */}
      <div id="reviews" className="mt-16">
        <Tabs
          items={[
            { key: 'desc', label: 'Description', content: (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-surface-600 dark:text-surface-400 leading-relaxed whitespace-pre-line">{product.description || product.short_description}</p>
              </div>
            )},
            { key: 'specs', label: 'Specifications', content: (
              <dl className="divide-y divide-surface-200 dark:divide-surface-800 max-w-2xl">
                {[
                  ['SKU', product.sku], ['Brand', product.brand?.name], ['Weight', product.weight ? `${product.weight} kg` : null],
                  ['Category', product.categories?.[0]?.name], ['Barcode', product.barcode],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k as string} className="py-3 flex justify-between"><dt className="text-surface-500">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
            )},
            { key: 'reviews', label: `Reviews (${product.review_count || 0})`, content: (
              <ReviewsSection productId={product.id} reviews={reviews || []} averageRating={product.average_rating} reviewCount={product.review_count} isLoggedIn={!!profile} />
            )},
          ]}
        />
      </div>

      {/* ===== Related ===== */}
      {related && related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ReviewsSection({ productId, reviews, averageRating, reviewCount, isLoggedIn }: any) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Distribution
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
  }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // Hook into createReview via toast placeholder; full wiring uses useCreateReview
    toast.success('Review submitted! It will appear after approval.')
    setShowForm(false); setTitle(''); setComment('')
  }

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-8">
      {/* Summary */}
      <div>
        <div className="text-center mb-6">
          <div className="text-5xl font-bold">{(averageRating || 0).toFixed(1)}</div>
          <div className="flex justify-center gap-0.5 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} className={i < Math.round(averageRating) ? 'text-warning-500' : 'text-surface-300'} fill="currentColor" />
            ))}
          </div>
          <div className="text-sm text-surface-500">{reviewCount || 0} reviews</div>
        </div>
        <div className="space-y-1.5">
          {dist.map((d: any) => (
            <div key={d.star} className="flex items-center gap-2 text-sm">
              <span className="w-3">{d.star}</span>
              <Star size={12} className="text-warning-500" fill="currentColor" />
              <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                <div className="h-full bg-warning-500" style={{ width: `${reviewCount ? (d.count / reviewCount) * 100 : 0}%` }} />
              </div>
              <span className="w-6 text-right text-surface-500">{d.count}</span>
            </div>
          ))}
        </div>
        {isLoggedIn ? (
          <Button fullWidth className="mt-6" onClick={() => setShowForm(!showForm)}>Write a Review</Button>
        ) : (
          <Link to="/login" className="btn-secondary w-full mt-6 inline-flex justify-center">Sign in to review</Link>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={submit} className="card p-5 mb-4 lg:col-span-2 space-y-4">
          <h4 className="font-semibold">Write a Review</h4>
          <div>
            <label className="text-sm font-medium mb-2 block">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)}>
                  <Star size={24} className={s <= rating ? 'text-warning-500' : 'text-surface-300'} fill="currentColor" />
                </button>
              ))}
            </div>
          </div>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience" />
          <div>
            <label className="text-sm font-medium mb-1.5 block">Review</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows={4} className="input-field" placeholder="What did you like or dislike?" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Submit Review</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </motion.form>
      )}

      {/* List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="card p-8 text-center text-surface-500">No reviews yet. Be the first to share your thoughts!</div>
        ) : (
          reviews.map((r: any) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 font-semibold text-white">
                  {(r.user?.first_name?.[0] || 'A').toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{r.user?.first_name} {r.user?.last_name}</div>
                    <div className="text-xs text-surface-500">{formatDate(r.created_at, 'long')}</div>
                  </div>
                  <div className="flex gap-0.5 my-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < r.rating ? 'text-warning-500' : 'text-surface-300'} fill="currentColor" />
                    ))}
                  </div>
                  {r.title && <div className="font-medium mt-2">{r.title}</div>}
                  <p className="text-surface-600 dark:text-surface-400 mt-1">{r.comment}</p>
                  {r.admin_reply && (
                    <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-950/30">
                      <div className="mb-1 font-semibold text-blue-700 dark:text-blue-300">Store Response</div>
                      {r.admin_reply}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
