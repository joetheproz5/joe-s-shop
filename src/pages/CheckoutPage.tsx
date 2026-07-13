import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, Check, CreditCard, MapPin, ClipboardList, Package, Truck, ShieldCheck,
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/utils'
import { Button, Input, Select } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { getProductImage } from '@/lib/productImages'
import type { Address } from '@/types'

type CheckoutAddress = Pick<
  Address,
  'first_name' | 'last_name' | 'street_address_1' | 'street_address_2' | 'city' | 'state' | 'postal_code' | 'country' | 'phone'
>

const EMPTY_ADDRESS: CheckoutAddress = {
  first_name: '', last_name: '', street_address_1: '', street_address_2: '',
  city: '', state: '', postal_code: '', country: 'United States', phone: '',
}

function toCheckoutAddress(address: Address): CheckoutAddress {
  return {
    first_name: address.first_name,
    last_name: address.last_name,
    street_address_1: address.street_address_1,
    street_address_2: address.street_address_2 || '',
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country,
    phone: address.phone || '',
  }
}

function addressesMatch(left: CheckoutAddress, right: CheckoutAddress) {
  return Object.keys(EMPTY_ADDRESS).every((key) => {
    const field = key as keyof CheckoutAddress
    return String(left[field] || '').trim().toLowerCase() === String(right[field] || '').trim().toLowerCase()
  })
}

const STEPS = [
  { key: 'shipping', label: 'Shipping', icon: MapPin },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'review', label: 'Review', icon: ClipboardList },
  { key: 'confirmation', label: 'Confirmation', icon: Package },
]

const PAYMENT_METHODS = [
  { value: 'cash_on_delivery', label: 'Cash on delivery', description: 'Pay when your order arrives.', available: true },
  { value: 'credit_card', label: 'Credit or debit card', description: 'Coming soon', available: false },
  { value: 'paypal', label: 'PayPal', description: 'Coming soon', available: false },
  { value: 'bank_transfer', label: 'Bank transfer', description: 'Coming soon', available: false },
] as const

function getCheckoutErrorMessage(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String(error.message)
      : ''

  if (/place_cash_on_delivery_order|schema cache|PGRST202/i.test(message)) {
    return 'Checkout needs the Supabase migration 003_cash_on_delivery_checkout.sql before orders can be placed.'
  }

  if (/row-level security|permission denied|42501/i.test(message)) {
    return 'Your account is not allowed to place this order. Sign out, sign back in, and try again.'
  }

  return message || 'Failed to place order. Please try again.'
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getSubtotal, getTax, getShipping, getTotal, clearCart } = useCartStore()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [orderNumber, setOrderNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState('new')
  const [saveAddress, setSaveAddress] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(true)

  const [shipping, setShipping] = useState<CheckoutAddress>(EMPTY_ADDRESS)
  const [billing, setBilling] = useState({ sameAsShipping: true, ...shipping })
  const paymentMethod = 'cash_on_delivery'

  useEffect(() => {
    let active = true

    const loadAddresses = async () => {
      if (!user?.id) {
        if (active) setLoadingAddresses(false)
        return
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })

      if (!active) return
      setLoadingAddresses(false)

      if (error) {
        console.error('Failed to load saved addresses', error)
        return
      }

      const addresses = (data || []) as Address[]
      setSavedAddresses(addresses)
      if (addresses[0]) {
        setSelectedAddressId(addresses[0].id)
        setShipping(toCheckoutAddress(addresses[0]))
      }
    }

    loadAddresses()
    return () => { active = false }
  }, [user?.id])

  const updateShipping = (field: keyof CheckoutAddress, value: string) => {
    setShipping((current) => ({ ...current, [field]: value }))
    setSelectedAddressId('new')
  }

  const chooseAddress = (value: string | string[] | null) => {
    const id = typeof value === 'string' ? value : 'new'
    setSelectedAddressId(id)

    if (id === 'new') {
      setShipping(EMPTY_ADDRESS)
      return
    }

    const address = savedAddresses.find((item) => item.id === id)
    if (address) {
      setShipping(toCheckoutAddress(address))
      setSaveAddress(false)
    }
  }

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
    if (!user?.id) {
      toast.error('Sign in before placing your order.')
      navigate('/login', { state: { from: '/checkout' } })
      return
    }

    setSubmitting(true)
    try {
      const shippingAddr = { ...shipping }
      const billingAddr = billing.sameAsShipping ? shippingAddr : { ...billing, sameAsShipping: undefined }
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
      }))

      const { data, error } = await supabase.rpc('place_cash_on_delivery_order', {
        p_shipping_address: shippingAddr,
        p_billing_address: billingAddr,
        p_items: orderItems,
        p_shipping_method: 'Standard',
      })

      if (error) throw new Error(getCheckoutErrorMessage(error))

      const placedOrder = data?.[0]
      if (!placedOrder) throw new Error('The order could not be confirmed. Please try again.')

      let addressSaved = true
      const alreadySaved = savedAddresses.some((address) => addressesMatch(toCheckoutAddress(address), shippingAddr))
      if (saveAddress && selectedAddressId === 'new' && !alreadySaved) {
        const { error: addressError } = await supabase.from('addresses').insert({
          ...shippingAddr,
          user_id: user.id,
          label: 'Home',
          is_default: savedAddresses.length === 0,
        })
        if (addressError) {
          addressSaved = false
          console.error('Order placed but address could not be saved', addressError)
        }
      }

      setOrderNumber(placedOrder.order_number)
      clearCart()
      setStep(3)
      toast.success('Cash-on-delivery order placed successfully!')
      if (!addressSaved) toast.error('Your order was placed, but the address could not be saved.')
    } catch (err) {
      toast.error(getCheckoutErrorMessage(err))
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
                {(loadingAddresses || savedAddresses.length > 0) && (
                  <Select
                    label="Saved address"
                    value={selectedAddressId}
                    onChange={chooseAddress}
                    loading={loadingAddresses}
                    clearable={false}
                    options={[
                      ...savedAddresses.map((address) => ({
                        label: `${address.label}${address.is_default ? ' (Default)' : ''} - ${address.street_address_1}, ${address.city}`,
                        value: address.id,
                      })),
                      { label: 'Use a new address', value: 'new' },
                    ]}
                  />
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="First name *" value={shipping.first_name} onChange={(e) => updateShipping('first_name', e.target.value)} required />
                  <Input label="Last name *" value={shipping.last_name} onChange={(e) => updateShipping('last_name', e.target.value)} required />
                </div>
                <Input label="Street address *" value={shipping.street_address_1} onChange={(e) => updateShipping('street_address_1', e.target.value)} required />
                <Input label="Apartment, suite, etc." value={shipping.street_address_2} onChange={(e) => updateShipping('street_address_2', e.target.value)} />
                <div className="grid sm:grid-cols-3 gap-4">
                  <Input label="City *" value={shipping.city} onChange={(e) => updateShipping('city', e.target.value)} required />
                  <Input label="State *" value={shipping.state} onChange={(e) => updateShipping('state', e.target.value)} required />
                  <Input label="ZIP *" value={shipping.postal_code} onChange={(e) => updateShipping('postal_code', e.target.value)} required />
                </div>
                <Input label="Country" value={shipping.country} onChange={(e) => updateShipping('country', e.target.value)} />
                <Input label="Phone" value={shipping.phone} onChange={(e) => updateShipping('phone', e.target.value)} placeholder="+1 (555) 000-0000" />

                {selectedAddressId === 'new' && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-surface-200 p-3 dark:border-surface-700">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(event) => setSaveAddress(event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-surface-300 text-primary-600"
                    />
                    <span>
                      <span className="block text-sm font-medium">Save this address for next time</span>
                      <span className="mt-0.5 block text-xs text-surface-500">It will appear in your account address book.</span>
                    </span>
                  </label>
                )}

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
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-start gap-3 border p-4 ${method.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-55'} ${paymentMethod === method.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-surface-300 dark:border-surface-700'}`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === method.value}
                          disabled={!method.available}
                          readOnly
                          className="mt-0.5 h-4 w-4 text-primary-600"
                        />
                        <span>
                          <span className="block text-sm font-medium">{method.label}</span>
                          <span className="mt-1 block text-xs text-surface-500">{method.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-surface-500"><ShieldCheck size={13} /> No payment is charged online. Pay the courier when the order arrives.</p>
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
                        <img src={item.product ? getProductImage(item.product) : ''} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.product?.name}</div>
                        <div className="text-xs text-surface-500">Qty: {item.quantity} x {formatCurrency(price)}</div>
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
                  Place COD Order - {formatCurrency(total)}
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
