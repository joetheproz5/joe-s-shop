import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Minus, Plus, Trash2, ShoppingCart, ArrowRight, Tag, Truck, ShoppingBag, ChevronRight,
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/utils'
import { Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getTax, getShipping, getTotal } = useCartStore()
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const subtotal = getSubtotal()
  const tax = getTax()
  const shipping = getShipping()
  const total = getTotal() - couponDiscount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle()
      if (error) throw error
      if (!data) { setCouponError('Invalid coupon code'); return }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { setCouponError('Coupon expired'); return }
      if (data.min_purchase && subtotal < data.min_purchase) { setCouponError(`Minimum purchase of ${formatCurrency(data.min_purchase)}`); return }
      if (data.max_uses && data.used_count >= data.max_uses) { setCouponError('Coupon usage limit reached'); return }

      let discount = 0
      if (data.type === 'percentage') discount = subtotal * (data.value / 100)
      else if (data.type === 'fixed') discount = data.value
      else if (data.type === 'free_shipping') discount = shipping

      setCouponDiscount(Math.min(discount, subtotal))
      toast.success('Coupon applied!')
    } catch {
      setCouponError('Failed to validate coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-6">
            <ShoppingBag className="text-surface-400" size={36} />
          </div>
          <h1 className="text-3xl font-bold mb-3">Your cart is empty</h1>
          <p className="text-surface-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
          <Link to="/shop" className="btn-primary inline-flex">
            <ShoppingCart size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <nav className="text-sm text-surface-500 mb-4">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight size={14} className="inline" />
        <span className="text-surface-900 dark:text-surface-50">Cart</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart ({items.length} items)</h1>
        <button onClick={clearCart} className="btn-ghost text-sm text-danger-500">Clear Cart</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item) => {
              const product = item.product
              const variant = item.variant
              const price = variant?.sale_price || variant?.price || product?.sale_price || product?.selling_price || 0
              const image = variant ? (product?.images?.[0]?.url) : (product?.images?.[0]?.url)

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  className="card p-4"
                >
                  <div className="flex gap-4">
                    <Link to={`/product/${product?.slug}`} className="w-24 h-24 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 flex-shrink-0">
                      {image ? (
                        <img src={image} alt={product?.name || 'Product'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="text-surface-300" size={24} /></div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/product/${product?.slug}`} className="font-semibold hover:text-primary-600 line-clamp-1">
                            {product?.name || 'Product'}
                          </Link>
                          {variant?.color && <div className="text-xs text-surface-500 mt-0.5">Color: {variant.color}{variant.size ? ` / Size: ${variant.size}` : ''}</div>}
                          {!variant && product?.sku && <div className="text-xs text-surface-500 mt-0.5">SKU: {product.sku}</div>}
                        </div>
                        <button
                          onClick={() => { removeItem(product!.id, variant?.id); toast.success('Removed from cart') }}
                          className="p-1.5 text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg"
                          aria-label="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-surface-300 dark:border-surface-700 rounded-lg">
                          <button onClick={() => updateQuantity(product!.id, variant?.id, item.quantity - 1)} className="p-2 hover:text-primary-600" aria-label="Decrease">
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(product!.id, variant?.id, item.quantity + 1)} className="p-2 hover:text-primary-600" aria-label="Increase">
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(price * item.quantity)}</div>
                          {item.quantity > 1 && <div className="text-xs text-surface-500">{formatCurrency(price)} each</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError('') }}
                    placeholder="Coupon code"
                    className="input-field pl-9 py-2 text-sm"
                  />
                </div>
                <Button onClick={handleApplyCoupon} loading={couponLoading} variant="secondary" size="sm">
                  Apply
                </Button>
              </div>
              {couponError && <p className="text-xs text-danger-500 mt-1.5">{couponError}</p>}
              {couponDiscount > 0 && (
                <p className="text-xs text-success-600 mt-1.5 flex items-center gap-1">
                  <span>✓ Coupon applied! You save {formatCurrency(couponDiscount)}</span>
                  <button onClick={() => setCouponDiscount(0)} className="text-danger-500 hover:underline">Remove</button>
                </p>
              )}
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-surface-500">Subtotal</dt><dd className="font-medium">{formatCurrency(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-surface-500">Tax (10%)</dt><dd className="font-medium">{formatCurrency(tax)}</dd></div>
              <div className="flex justify-between"><dt className="text-surface-500">Shipping</dt><dd className="font-medium">{shipping === 0 ? <span className="text-success-600">Free</span> : formatCurrency(shipping)}</dd></div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-success-600"><dt>Coupon</dt><dd>-{formatCurrency(couponDiscount)}</dd></div>
              )}
              <div className="border-t border-surface-200 dark:border-surface-800 pt-3 flex justify-between text-base font-bold">
                <dt>Total</dt><dd>{formatCurrency(Math.max(total, 0))}</dd>
              </div>
            </dl>

            {subtotal < 100 && (
              <div className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-sm text-primary-700 dark:text-primary-300 flex items-center gap-2">
                <Truck size={16} />
                Add {formatCurrency(100 - subtotal)} more for free shipping!
              </div>
            )}

            <Link to="/checkout" className="btn-primary w-full mt-6 justify-center text-base py-3">
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <Link to="/shop" className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
