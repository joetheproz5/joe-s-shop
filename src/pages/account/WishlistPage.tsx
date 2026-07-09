import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Trash2, ShoppingCart } from 'lucide-react'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency, getDiscountPercentage } from '@/lib/utils'
import { Skeleton } from '@/components/ui'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore()
  const addItem = useCartStore((s) => s.addItem)

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
          <Heart className="text-surface-400" size={28} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
        <p className="text-surface-500 mb-6">Save items you love to find them quickly later.</p>
        <Link to="/shop" className="btn-primary inline-flex">Browse Products</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">My Wishlist ({items.length})</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((product, i) => {
          const onSale = product.sale_price && product.sale_price < product.selling_price
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card overflow-hidden group"
            >
              <Link to={`/product/${product.slug}`} className="block relative aspect-square bg-surface-100 dark:bg-surface-800 overflow-hidden">
                <img
                  src={product.images?.[0]?.url || 'https://placehold.co/400x400?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {onSale && (
                  <span className="absolute top-3 left-3 badge-danger">
                    -{getDiscountPercentage(product.selling_price, product.sale_price!)}%
                  </span>
                )}
              </Link>
              <div className="p-4">
                <Link to={`/product/${product.slug}`} className="font-medium hover:text-primary-600 line-clamp-1">
                  {product.name}
                </Link>
                <div className="flex items-center gap-2 mt-2 mb-4">
                  <span className="font-bold">{formatCurrency(product.sale_price || product.selling_price)}</span>
                  {onSale && (
                    <span className="text-sm text-surface-400 line-through">{formatCurrency(product.selling_price)}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addItem(product)
                      toast.success('Added to cart')
                    }}
                    className="btn-primary flex-1 text-sm py-2"
                  >
                    <ShoppingCart size={16} /> Add
                  </button>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="btn-secondary px-3 py-2"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} className="text-danger-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
