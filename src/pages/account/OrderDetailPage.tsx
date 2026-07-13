import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Printer, MapPin, CreditCard } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { Skeleton, Badge } from '@/components/ui'
import type { OrderItem } from '@/types'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: order, isLoading } = useOrder(user?.id || '', id || '')

  if (isLoading) {
    return <Skeleton variant="rectangle" className="h-96" />
  }

  if (!order) {
    return (
      <div className="card p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">Order not found</h3>
        <Link to="/account/orders" className="btn-primary inline-flex mt-4">Back to Orders</Link>
      </div>
    )
  }

  const status = ORDER_STATUSES.find((s) => s.value === order.status)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-4">
        <ArrowLeft size={16} /> All Orders
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-surface-500">Placed on {formatDate(order.created_at, 'long')}</p>
        </div>
        <div className="flex items-center gap-3">
          {status && <Badge variant={status.color as 'primary'}>{status.label}</Badge>}
          <button onClick={() => window.print()} className="btn-secondary">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* Status timeline */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold mb-4">Order Status</h3>
        <div className="flex items-center justify-between overflow-x-auto">
          {ORDER_STATUSES.slice(0, 5).map((s, i) => {
            const currentIdx = ORDER_STATUSES.findIndex((x) => x.value === order.status)
            const done = i <= currentIdx
            return (
              <div key={s.value} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    done ? 'bg-primary-600 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-[10px] mt-1 whitespace-nowrap">{s.label}</span>
                </div>
                {i < 4 && <div className={`h-0.5 flex-1 mx-2 ${done && i < currentIdx ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-700'}`} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card divide-y divide-surface-200 dark:divide-surface-800">
            {(order.items || []).map((item: OrderItem) => (
              <div key={item.id} className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-100 dark:bg-surface-800 overflow-hidden flex-shrink-0">
                  {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.product_name}</div>
                  <div className="text-sm text-surface-500">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</div>
                </div>
                <div className="font-semibold">{formatCurrency(item.total_price)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary + addresses */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-surface-500">Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-surface-500">Tax</dt><dd>{formatCurrency(order.tax)}</dd></div>
              <div className="flex justify-between"><dt className="text-surface-500">Shipping</dt><dd>{formatCurrency(order.shipping_cost)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-success-600"><dt>Discount</dt><dd>-{formatCurrency(order.discount)}</dd></div>}
              <div className="border-t border-surface-200 dark:border-surface-800 pt-2 flex justify-between font-bold text-base"><dt>Total</dt><dd>{formatCurrency(order.total)}</dd></div>
            </dl>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3"><MapPin size={18} className="text-surface-400" /><h3 className="font-semibold">Shipping Address</h3></div>
            <p className="text-sm text-surface-600 dark:text-surface-400 whitespace-pre-line">
              {order.shipping_address ? formatAddress(order.shipping_address) : 'N/A'}
            </p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3"><CreditCard size={18} className="text-surface-400" /><h3 className="font-semibold">Payment</h3></div>
            <p className="text-sm capitalize">{order.payment_method?.replace(/_/g, ' ') || 'Payment method not recorded'}</p>
            <p className="mt-1 text-xs capitalize text-surface-500">Status: {order.payment_status}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatAddress(addr: any): string {
  if (typeof addr === 'string') return addr
  return [
    `${addr.first_name || ''} ${addr.last_name || ''}`.trim(),
    addr.street_address_1,
    addr.street_address_2,
    `${addr.city || ''}, ${addr.state || ''} ${addr.postal_code || ''}`.trim(),
    addr.country,
  ].filter(Boolean).join('\n')
}

// Small wrapper hook: load a single order by id
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
function useOrder(userId: string, orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', orderId)
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!userId && !!orderId,
  })
}
