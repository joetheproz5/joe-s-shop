import { Star, ShoppingCart, Heart, X, Minus, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'
import { formatCurrency, getDiscountPercentage, clsx } from '@/lib/utils'
import { Button, Modal } from '@/components/ui'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

export function QuickViewModal() {
  const { quickViewOpen, quickViewProductId, closeQuickView } = useUIStore()
  const addItem = useCartStore((s) => s.addItem)
  const [qty, setQty] = useState(1)

  useEffect(() => setQty(1), [quickViewProductId, quickViewOpen])

  const { data: product, isLoading } = useQuery({
    queryKey: ['product-quickview', quickViewProductId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`*, images:product_images(*), brand:brands(*)`)
        .eq('id', quickViewProductId)
        .maybeSingle()
      if (error) throw error
      return data as Product
    },
    enabled: !!quickViewProductId && quickViewOpen,
  })

  if (!quickViewOpen) return null

  const handleAdd = () => {
    if (!product) return
    const added = addItem(product, undefined, qty)
    if (added > 0) {
      toast.success(added === qty ? 'Added to cart' : `Added ${added}; stock limit reached`)
      closeQuickView()
    } else {
      toast.error(`Only ${product.stock_quantity} available`)
    }
  }

  return (
    <Modal isOpen={quickViewOpen} onClose={closeQuickView} title="" size="lg" closeOnOverlayClick>
      <div className="-mt-2">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6">
            <div className="aspect-square bg-surface-100 dark:bg-surface-800 animate-pulse rounded-xl" />
            <div className="space-y-3">
              <div className="h-6 bg-surface-100 dark:bg-surface-800 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-surface-100 dark:bg-surface-800 animate-pulse rounded w-1/2" />
              <div className="h-8 bg-surface-100 dark:bg-surface-800 animate-pulse rounded mt-4" />
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-2 gap-6">
            {/* Image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800">
              <img src={product.images?.[0]?.url || 'https://placehold.co/400x400?text=No+Image'} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div>
              {product.brand && (
                <Link to={`/shop?brand_id=${product.brand.id}`} className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">{product.brand.name}</Link>
              )}
              <Link to={`/product/${product.slug}`} className="block text-xl font-bold mt-1 hover:text-primary-600">{product.name}</Link>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(product.average_rating) ? 'text-warning-500' : 'text-surface-300'} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm text-surface-500">({product.review_count})</span>
              </div>

              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-2xl font-bold">{formatCurrency(product.sale_price ?? product.selling_price)}</span>
                {product.sale_price && product.sale_price < product.selling_price && (
                  <span className="text-sm text-surface-400 line-through">{formatCurrency(product.selling_price)}</span>
                )}
              </div>

              <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 line-clamp-3">{product.short_description}</p>

              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center border border-surface-300 dark:border-surface-700 rounded-lg">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2"><Minus size={14} /></button>
                  <span className="w-10 text-center text-sm">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))} disabled={qty >= product.stock_quantity} className="p-2 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Increase quantity"><Plus size={14} /></button>
                </div>
                <Button size="sm" onClick={handleAdd} disabled={product.stock_quantity <= 0} leftIcon={<ShoppingCart size={16} />} className="flex-1">{product.stock_quantity <= 0 ? 'Out of stock' : 'Add to Cart'}</Button>
              </div>
              <p className="mt-2 text-xs text-surface-500">{product.stock_quantity} available</p>

              <Link to={`/product/${product.slug}`} className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline mt-3">
                View Full Details →
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-surface-500">Product not found.</div>
        )}
      </div>
    </Modal>
  )
}
