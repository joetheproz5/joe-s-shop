import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react'
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -4 }}
      className="card group flex flex-col"
    >
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-surface-100 dark:bg-surface-800">
        {featuredImage ? (
          <img
            src={featuredImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-300">
            <ShoppingCart size={48} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {onSale && <span className="badge-danger">-{discount}%</span>}
          {product.is_new_arrival && <span className="badge-primary">New</span>}
          {product.is_best_seller && <span className="badge-warning">Best Seller</span>}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className={clsx(
            'absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all',
            isInWishlist
              ? 'bg-danger-500 text-white'
              : 'bg-white/80 dark:bg-surface-900/80 text-surface-700 dark:text-surface-300 hover:bg-white dark:hover:bg-surface-800'
          )}
        >
          <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="badge bg-white text-surface-900 text-sm font-semibold">Out of Stock</span>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex-1 bg-white dark:bg-surface-900 text-surface-900 dark:text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-50"
          >
            <ShoppingCart size={16} /> Add
          </button>
          <button
            onClick={handleQuickView}
            aria-label="Quick view"
            className="w-10 bg-white dark:bg-surface-900 text-surface-900 dark:text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <Eye size={16} />
          </button>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {product.brand && (
          <span className="text-xs text-surface-500 mb-1">{product.brand.name}</span>
        )}
        <Link
          to={`/product/${product.slug}`}
          className="font-medium leading-snug hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
        >
          {product.name}
        </Link>

        {variant === 'default' && (
          <div className="flex items-center gap-1 mt-1.5 mb-2">
            <Star size={13} className="text-warning-500" fill="currentColor" />
            <span className="text-xs font-medium">{product.average_rating?.toFixed(1) || '0.0'}</span>
            <span className="text-xs text-surface-400">({product.review_count || 0})</span>
            {stock.status === 'low_stock' && (
              <span className="ml-auto text-xs text-warning-600 dark:text-warning-400">Low stock</span>
            )}
          </div>
        )}

        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="text-lg font-bold">{formatCurrency(product.sale_price ?? product.selling_price)}</span>
          {onSale && (
            <span className="text-sm text-surface-400 line-through">{formatCurrency(product.selling_price)}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
