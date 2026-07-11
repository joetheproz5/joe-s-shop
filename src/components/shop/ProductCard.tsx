import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react'
import type { Product } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useUIStore } from '@/stores/uiStore'
import { formatCurrency, getDiscountPercentage, getStockStatus, clsx } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact'
  index?: number
}

export function ProductCard({ product, variant = 'default', index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggleItem)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id))
  const openQuickView = useUIStore((s) => s.openQuickView)

  const onSale = product.sale_price != null && product.sale_price < product.selling_price
  const discount = onSale ? getDiscountPercentage(product.selling_price, product.sale_price!) : 0
  const stock = getStockStatus(product.stock_quantity, product.low_stock_threshold)
  const outOfStock = product.stock_quantity <= 0
  const featuredImage = product.images?.find((img) => img.is_featured)?.url || product.images?.[0]?.url

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleWishlist(product)
    toast.success(added ? 'Added to wishlist' : 'Removed from wishlist')
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openQuickView(product.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      className="group flex min-w-0 flex-col"
    >
      <Link to={`/product/${product.slug}`} className="relative block aspect-[.88] overflow-hidden rounded-[1.5rem] bg-[#f5f5f3] dark:bg-surface-900">
        {featuredImage ? (
          <img
            src={featuredImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-300">
            <ShoppingBag size={42} strokeWidth={1.4} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {onSale && <span className="rounded-full bg-surface-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white dark:bg-white dark:text-surface-950">Save {discount}%</span>}
          {product.is_new_arrival && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-surface-900 backdrop-blur-md">New</span>}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className={clsx(
            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all',
            isInWishlist
              ? 'bg-danger-500 text-white'
              : 'bg-white/80 text-surface-700 opacity-100 hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 dark:bg-surface-950/80 dark:text-surface-200'
          )}
        >
          <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-surface-900">Out of stock</span>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full gap-2 p-3 transition-transform duration-300 group-hover:translate-y-0 sm:flex">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-surface-950 py-3 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-blue-600 disabled:opacity-50 dark:bg-white dark:text-surface-950 dark:hover:bg-blue-500 dark:hover:text-white"
          >
            <ShoppingBag size={15} /> Add to bag
          </button>
          <button
            onClick={handleQuickView}
            aria-label="Quick view"
            className="flex w-11 items-center justify-center rounded-full bg-white text-surface-900 shadow-lg hover:bg-surface-100 dark:bg-surface-900 dark:text-white"
          >
            <Eye size={16} />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-4">
        {product.brand && (
          <span className="mb-1 text-[11px] font-semibold uppercase tracking-[.12em] text-surface-400">{product.brand.name}</span>
        )}
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-.01em] transition-colors hover:text-blue-600 dark:hover:text-blue-400 sm:text-base"
        >
          {product.name}
        </Link>

        {variant === 'default' && (
          <div className="mb-2 mt-2 flex items-center gap-1">
            <Star size={12} className="text-surface-800 dark:text-surface-200" fill="currentColor" />
            <span className="text-xs font-medium">{product.average_rating?.toFixed(1) || '0.0'}</span>
            <span className="text-xs text-surface-400">({product.review_count || 0})</span>
            {stock.status === 'low_stock' && (
              <span className="ml-auto text-xs text-warning-600 dark:text-warning-400">Low stock</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-sm font-semibold sm:text-base">{formatCurrency(product.sale_price ?? product.selling_price)}</span>
          {onSale && (
            <span className="text-sm text-surface-400 line-through">{formatCurrency(product.selling_price)}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
