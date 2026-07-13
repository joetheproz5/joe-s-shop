import { Link } from 'react-router-dom'
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react'
import type { Product } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useUIStore } from '@/stores/uiStore'
import { formatCurrency, getDiscountPercentage, getStockStatus, clsx } from '@/lib/utils'
import { getProductImage } from '@/lib/productImages'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact'
  index?: number
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const toggleWishlist = useWishlistStore((state) => state.toggleItem)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id))
  const openQuickView = useUIStore((state) => state.openQuickView)

  const onSale = product.sale_price != null && product.sale_price < product.selling_price
  const discount = onSale ? getDiscountPercentage(product.selling_price, product.sale_price!) : 0
  const stock = getStockStatus(product.stock_quantity, product.low_stock_threshold)
  const outOfStock = product.stock_quantity <= 0
  const image = getProductImage(product)

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (outOfStock) return
    const added = addItem(product)
    if (added > 0) toast.success(`${product.name} added to cart`)
    else toast.error('This item is currently unavailable')
  }

  const handleWishlist = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const added = toggleWishlist(product)
    toast.success(added ? 'Added to wishlist' : 'Removed from wishlist')
  }

  const handleQuickView = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    openQuickView(product.id)
  }

  return (
    <article
      className={clsx(
        'group min-w-0',
        variant === 'compact' && 'grid grid-cols-[112px_minmax(0,1fr)] gap-4 rounded-lg border border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900'
      )}
    >
      <Link
        to={`/product/${product.slug}`}
        className={clsx(
          'relative block overflow-hidden rounded-lg bg-white',
          variant === 'default' ? 'aspect-[4/5]' : 'aspect-square'
        )}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full transform-gpu object-contain p-4 [backface-visibility:hidden] motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:will-change-transform group-hover:scale-[1.025] sm:p-6"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-surface-300">
            <ShoppingCart size={42} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {onSale && <span className="rounded-full bg-[#c5221f] px-2.5 py-1 text-[11px] font-semibold text-white">-{discount}%</span>}
          {product.is_new_arrival && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#0b57d0] shadow-sm">New</span>}
          {product.is_best_seller && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-surface-800 shadow-sm">Popular</span>}
        </div>

        <button
          onClick={handleWishlist}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={clsx(
            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors',
            isInWishlist ? 'text-[#c5221f]' : 'text-surface-600 hover:text-[#0b57d0]'
          )}
        >
          <Heart size={17} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/65 backdrop-blur-[2px] dark:bg-surface-950/65">
            <span className="rounded-full bg-surface-900 px-3 py-1.5 text-xs font-semibold text-white">Out of stock</span>
          </div>
        )}

        {variant === 'default' && !outOfStock && (
          <div className="absolute inset-x-3 bottom-3 flex translate-y-2 transform-gpu gap-2 opacity-0 [backface-visibility:hidden] motion-safe:transition-[transform,opacity] motion-safe:duration-150 motion-safe:ease-out motion-safe:will-change-[transform,opacity] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <button
              onClick={handleAddToCart}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0b57d0] px-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0842a0]"
            >
              <ShoppingCart size={16} /> Add to cart
            </button>
            <button
              onClick={handleQuickView}
              aria-label="Quick view"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-surface-700 shadow-md transition-colors hover:text-[#0b57d0]"
            >
              <Eye size={17} />
            </button>
          </div>
        )}
      </Link>

      <div className={clsx('flex min-w-0 flex-col', variant === 'default' ? 'pt-3' : 'py-1')}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-surface-500 dark:text-surface-400">
            {product.brand?.name || 'Joe\'s Shop'}
          </span>
          {variant === 'default' && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-surface-500">
              <Star size={12} className="text-[#f9ab00]" fill="currentColor" />
              {product.average_rating?.toFixed(1) || 'New'}
            </span>
          )}
        </div>
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-5 text-surface-900 transition-colors hover:text-[#0b57d0] sm:text-[15px] dark:text-white"
        >
          {product.name}
        </Link>
        {variant === 'compact' && (
          <p className="mt-1 line-clamp-2 text-sm text-surface-500">{product.short_description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2.5">
          <span className="font-semibold text-surface-950 dark:text-white">
            {formatCurrency(product.sale_price ?? product.selling_price)}
          </span>
          {onSale && <span className="text-xs text-surface-400 line-through">{formatCurrency(product.selling_price)}</span>}
          {stock.status === 'low_stock' && <span className="ml-auto text-xs font-medium text-[#b06000]">Low stock</span>}
        </div>
        {variant === 'compact' && !outOfStock && (
          <button onClick={handleAddToCart} className="mt-3 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#0b57d0] hover:text-[#0842a0]">
            <ShoppingCart size={15} /> Add to cart
          </button>
        )}
      </div>
    </article>
  )
}
