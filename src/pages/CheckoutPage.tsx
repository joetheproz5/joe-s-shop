import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, Check, CreditCard, MapPin, ClipboardList, Package, Truck, ShieldCheck,
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/utils'
import { Button, Input } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { generateOrderNumber } from '@/lib/utils'
import type { Address } from '@/types'
import toast from 'react-hot-toast'

const STEPS = [
  { key: 'shipping', label: 'Shipping', icon: MapPin },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'review', label: 'Review', icon: ClipboardList },
  { key: 'confirmation', label: 'Confirmation', icon: Package },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getSubtotal, getTax, getShipping, getTotal, clearCart, updateQuantity } = useCartStore()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [orderNumber, setOrderNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [shipping, setShipping] = useState({
    first_name: '', last_name: '', street_address_1: '', street_address_2: '',
    city: '', state: '', postal_code: '', country: 'United States', phone: '',
  })
  const [billing, setBilling] = useState({ sameAsShipping: true, ...shipping })
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  const subtotal = getSubtotal()
  const tax = getTax()
  const shippingCost = getShipping()
  const total = getTotal()

  const canProceedShipping = shipping.first_name && shipping.last_name && shipping.street_address_1 && shipping.city && shipping.state && shipping.postal_code

  if (items.length === 0 && step < 3) {
    navigate('/cart')
    return null
  }

  const handlePlaceOrder = async () => {
    setSubmitting(true)
    try {
      const productIds = [...new Set(items.map((item) => item.product_id))]
      const variantIds = [...new Set(items.map((item) => item.variant_id).filter((id): id is string => !!id))]
      const { data: currentProducts, error: productsError } = await supabase
        .from('products')
        .select('id,name,stock_quantity')
        .in('id', productIds)
      if (productsError) throw new Error(`Could not verify product stock: ${productsError.message}`)

      const currentVariants = variantIds.length > 0
        ? await supabase.from('product_variants').select('id,product_id,stock_quantity').in('id', variantIds)
        : { data: [], error: null }
      if (currentVariants.error) throw new Error(`Could not verify variant stock: ${currentVariants.error.message}`)

      const productStock = new Map((currentProducts ?? []).map((product) => [product.id, product]))
      const variantStock = new Map((currentVariants.data ?? []).map((variant) => [variant.id, variant]))

      for (const item of items) {
        const currentProduct = productStock.get(item.product_id)
        const currentVariant = item.variant_id ? variantStock.get(item.variant_id) : undefined
        const available = currentVariant?.stock_quantity ?? currentProduct?.stock_quantity ?? 0
        const name = item.product?.name || currentProduct?.name || 'This product'
        if (!currentProduct || (item.variant_id && !currentVariant)) {
          updateQuantity(item.product_id, item.variant_id, 0)
          throw new Error(`${name} is no longer available and was removed from your cart.`)
        }
        if (item.quantity > available) {
          updateQuantity(item.product_id, item.variant_id, available)
          throw new Error(`${name} only has ${available} available. Your cart has been updated.`)
        }
      }

      const orderNum = generateOrderNumber()
      const shippingAddr = { ...shipping }
      const billingAddr = billing.sameAsShipping ? shippingAddr : { ...billing, sameAsShipping: undefined }

      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user?.id,
        order_number: orderNum,
        status: 'pending',
        payment_status: 'pending',
        subtotal, tax, shipping_cost: shippingCost, discount: 0, total,
        shipping_method: 'Standard',
        shipping_address: shippingAddr,
        billing_address: billingAddr,
        payment_method: paymentMethod,
      }).select().single()

      if (error) throw error

      // Insert order items
      const orderItems = items.map((item) => {
        const price = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.selling_price || 0
        return {
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          product_name: item.product?.name || 'Product',
          product_image: item.product?.images?.[0]?.url || '',
          sku: item.variant?.sku || item.product?.sku || '',
          quantity: item.quantity,
          unit_price: price,
          total_price: price * item.quantity,
        }
      })
      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      setOrderNumber(orderNum)
      clearCart()
      setStep(3)
      toast.success('Order placed successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const stepIdx = Math.min(step, 3)

  return (
    <div className="page-container">
      {/* Steps */}
      <div className="flex items-center justify-center mb-10 overflow-x-auto no-scrollbar">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
              i < stepIdx ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' :
              i === stepIdx ? 'text-white bg-primary-600' :
              'text-surface-400'
            }`}>
              {i < stepIdx ? <Check size={16} /> : <s.icon size={16} />}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={16} className="mx-1 text-surface-300" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Shipping */}
        {stepIdx === 0 && (
          <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><MapPin size={24} /> Shipping Information</h2>
              <div className="card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="First name *" value={shipping.first_name} onChange={(e) => setShipping({ ...shipping, first_name: e.target.value })} required />
                  <Input label="Last name *" value={shipping.last_name} onChange={(e) => setShipping({ ...shipping, last_name: e.target.value })} required />
                </div>
                <Input label="Street address *" value={shipping.street_address_1} onChange={(e) => setShipping({ ...shipping, street_address_1: e.target.value })} required />
                <Input label="Apartment, suite, etc." value={shipping.street_address_2} onChange={(e) => setShipping({ ...shipping, street_address_2: e.target.value })} />
                <div className="grid sm:grid-cols-3 gap-4">
                  <Input label="City *" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} required />
                  <Input label="State *" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} required />
                  <Input label="ZIP *" value={shipping.postal_code} onChange={(e) => setShipping({ ...shipping, postal_code: e.target.value })} required />
                </div>
                <Input label="Country" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} />
                <Input label="Phone" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} placeholder="+1 (555) 000-0000" />

                {shippingCost === 0 ? (
                  <div className="p-3 rounded-xl bg-success-50 dark:bg-success-900/20 text-sm text-success-700 dark:text-success-300 flex items-center gap-2">
                    <Truck size={16} /> You qualify for free shipping!
                  </div>
                ) : (
                  <div className="text-sm text-surface-500">Standard shipping: {formatCurrency(shippingCost)}</div>
                )}
              </div>
              <div className="flex justify-between mt-6">
                <Link to="/cart" className="btn-secondary">&larr; Back to Cart</Link>
                <Button disabled={!canProceedShipping} onClick={() => setStep(1)}>
                  Continue to Billing <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: Billing */}
        {stepIdx === 1 && (
          <motion.div key="billing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><CreditCard size={24} /> Payment Method</h2>
              <div className="card p-6 space-y-6">
                <label className="flex items-center gap-3 cursor-pointer p-4 border border-surface-300 dark:border-surface-700 rounded-xl hover:border-primary-300">
                  <input type="radio" name="payment" checked={billing.sameAsShipping} onChange={() => setBilling({ ...billing, sameAsShipping: true })} className="w-4 h-4 text-primary-600" />
                  <span className="font-medium">Billing address same as shipping</span>
                </label>

                {!billing.sameAsShipping && (
                  <div className="space-y-4 pl-2">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="First name" value={billing.first_name} onChange={(e) => setBilling({ ...billing, first_name: e.target.value })} />
                      <Input label="Last name" value={billing.last_name} onChange={(e) => setBilling({ ...billing, last_name: e.target.value })} />
                    </div>
                    <Input label="Street address" value={billing.street_address_1} onChange={(e) => setBilling({ ...billing, street_address_1: e.target.value })} />
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Input label="City" value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} />
                      <Input label="State" value={billing.state} onChange={(e) => setBilling({ ...billing, state: e.target.value })} />
                      <Input label="ZIP" value={billing.postal_code} onChange={(e) => setBilling({ ...billing, postal_code: e.target.value })} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold mb-3 block">Payment Method</label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'].map((m) => (
                      <label key={m} className={`flex items-center gap-3 cursor-pointer p-4 border rounded-xl transition-colors ${paymentMethod === m ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-surface-300 dark:border-surface-700 hover:border-surface-400'}`}>
                        <input type="radio" name="payment_method" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-medium capitalize">{m.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-surface-400 mt-2 flex items-center gap-1"><ShieldCheck size={12} /> Payments are secured with 256-bit encryption</p>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(0)} className="btn-secondary">&larr; Back</button>
                <Button onClick={() => setStep(2)}>
                  Review Order <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Review */}
        {stepIdx === 2 && (
          <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ClipboardList size={24} /> Review Your Order</h2>

              {/* Items */}
              <div className="card divide-y divide-surface-200 dark:divide-surface-800 mb-6">
                <div className="p-4 font-semibold flex items-center gap-2"><Package size={18} /> Order Items ({items.length})</div>
                {items.map((item) => {
                  const price = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.selling_price || 0
                  return (
                    <div key={item.id} className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-surface-100 dark:bg-surface-800 overflow-hidden flex-shrink-0">
                        <img src={item.product?.images?.[0]?.url || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.product?.name}</div>
                        <div className="text-xs text-surface-500">Qty: {item.quantity} × {formatCurrency(price)}</div>
                      </div>
                      <div className="font-semibold">{formatCurrency(price * item.quantity)}</div>
                    </div>
                  )
                })}
              </div>

              {/* Addresses */}
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="card p-4">
                  <div className="font-semibold mb-2 text-sm">Shipping Address</div>
                  <p className="text-sm text-surface-600 dark:text-surface-400 whitespace-pre-line">
                    {shipping.first_name} {shipping.last_name}\n{shipping.street_address_1}\n{shipping.city}, {shipping.state} {shipping.postal_code}
                  </p>
                </div>
                <div className="card p-4">
                  <div className="font-semibold mb-2 text-sm">Payment</div>
                  <p className="text-sm text-surface-600 dark:text-surface-400 capitalize">{paymentMethod.replace(/_/g, ' ')}</p>
                  {!billing.sameAsShipping && (
                    <p className="text-xs text-surface-500 mt-2">Billing: {billing.city}, {billing.state}</p>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="card p-5">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-surface-500">Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
                  <div className="flex justify-between"><dt className="text-surface-500">Tax</dt><dd>{formatCurrency(tax)}</dd></div>
                  <div className="flex justify-between"><dt className="text-surface-500">Shipping</dt><dd>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</dd></div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold"><dt>Total</dt><dd>{formatCurrency(total)}</dd></div>
                </dl>
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary">&larr; Back</button>
                <Button size="lg" onClick={handlePlaceOrder} loading={submitting} leftIcon={<ShieldCheck size={18} />}>
                  Place Order — {formatCurrency(total)}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {stepIdx === 3 && (
          <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-12">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
              <Check className="text-success-600" size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-3">Order Confirmed!</h1>
            <p className="text-surface-500 mb-2">Thank you for your purchase.</p>
            <p className="text-lg font-semibold mb-8">Order Number: <span className="text-primary-600">{orderNumber}</span></p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/account/orders" className="btn-primary inline-flex justify-center">View Orders</Link>
              <Link to="/shop" className="btn-secondary inline-flex justify-center">Continue Shopping</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
