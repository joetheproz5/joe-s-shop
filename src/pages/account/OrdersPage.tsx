import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useOrders } from '@/hooks/useOrders'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { Skeleton } from '@/components/ui'

export default function OrdersPage() {
  const { user } = useAuth()
  const { data: orders, isLoading } = useOrders(user?.id || '')

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangle" className="h-32" />
        ))}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
          <ShoppingBag className="text-surface-400" size={28} />
        </div>
        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
        <p className="text-surface-500 mb-6">When you place your first order, it will appear here.</p>
        <Link to="/shop" className="btn-primary inline-flex">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Order History ({orders.length})</h2>
      {orders.map((order, i) => {
        const status = ORDER_STATUSES.find((s) => s.value === order.status)
        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={`/account/orders/${order.id}`} className="card p-5 block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Package className="text-primary-600 dark:text-primary-400" size={22} />
                  </div>
                  <div>
                    <div className="font-semibold">{order.order_number}</div>
                    <div className="text-sm text-surface-500">{formatDate(order.created_at, 'long')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {status && (
                    <span className={`badge-${status.color} capitalize`}>
                      {status.label}
                    </span>
                  )}
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(order.total)}</div>
                    <div className="text-xs text-surface-500">{order.items?.length || 0} items</div>
                  </div>
                  <ChevronRight className="text-surface-400" size={20} />
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
