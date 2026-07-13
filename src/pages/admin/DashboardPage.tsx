import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown,
  ArrowUpRight, AlertTriangle, Clock,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { fetchDashboardStats, fetchOrderStatusData, fetchSalesData } from '@/lib/api/analytics'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { Skeleton } from '@/components/ui'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const statsQuery = useDashboardStats()
  const salesQuery = useSalesData()
  const orderStatusQuery = useOrderStatusData()
  const stats = statsQuery.data
  const hasLiveDataError = statsQuery.isError || salesQuery.isError || orderStatusQuery.isError

  const cards = [
    { label: 'Total Revenue', value: statsQuery.isError ? '--' : formatCurrency(stats?.total_revenue ?? 0), change: stats?.revenue_change, icon: DollarSign, color: 'primary' as const },
    { label: 'Total Orders', value: statsQuery.isError ? '--' : formatNumber(stats?.total_orders ?? 0), change: stats?.orders_change, icon: ShoppingCart, color: 'success' as const },
    { label: 'Customers', value: statsQuery.isError ? '--' : formatNumber(stats?.total_customers ?? 0), change: stats?.customers_change, icon: Users, color: 'warning' as const },
    { label: 'Active Products', value: statsQuery.isError ? '--' : formatNumber(stats?.total_products ?? 0), change: stats?.products_change, icon: Package, color: 'danger' as const },
  ]

  const retryLiveData = () => {
    statsQuery.refetch()
    salesQuery.refetch()
    orderStatusQuery.refetch()
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-surface-500 text-sm mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {hasLiveDataError && (
        <div className="flex flex-col gap-3 rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 sm:flex-row sm:items-center sm:justify-between dark:border-danger-900/50 dark:bg-danger-950/20 dark:text-danger-300">
          <span>Some live dashboard data could not be loaded. Check your connection or Supabase permissions.</span>
          <button type="button" onClick={retryLiveData} className="shrink-0 font-semibold hover:underline">Try again</button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsQuery.isLoading
          ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)
          : cards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-surface-500">{card.label}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${statToneClasses[card.color]}`}>
                    <card.icon size={20} />
                  </div>
                </div>
                {card.change !== undefined && (
                  <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${card.change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {card.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(card.change).toFixed(1)}% vs last month
                  </div>
                )}
              </motion.div>
            ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Revenue Overview</h3>
            <span className="text-xs text-surface-500">Last 30 days</span>
          </div>
          {salesQuery.isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : salesQuery.isError ? (
            <ChartMessage message="Revenue data is unavailable." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesQuery.data || []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0b57d0" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#0b57d0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-surface-700" />
                <XAxis dataKey="date" tickFormatter={formatChartDate} tick={{ fontSize: 11 }} minTickGap={24} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => formatCompactCurrency(Number(value))} width={58} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                  labelFormatter={(value) => formatFullChartDate(String(value))}
                  contentStyle={{ borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0b57d0" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Orders by status */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5">
          <h3 className="font-semibold mb-4">Orders by Status</h3>
          {orderStatusQuery.isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : orderStatusQuery.isError ? (
            <ChartMessage message="Order status data is unavailable." />
          ) : orderStatusQuery.data?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusQuery.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {orderStatusQuery.data.map((entry) => (
                    <Cell key={entry.status} fill={orderStatusColors[entry.status] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Orders']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartMessage message="No orders yet." />
          )}
        </motion.div>
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RecentOrders />
        <LowStockAlerts />
      </div>
    </div>
  )
}

function RecentOrders() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at, user:profiles(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw new Error(error.message)
      return data || []
    },
  })

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Orders</h3>
        <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
          View all <ArrowUpRight size={12} />
        </Link>
      </div>
      {isLoading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 mb-2" />)
      ) : isError ? (
        <ChartMessage message="Recent orders are unavailable." compact />
      ) : orders && orders.length > 0 ? (
        <div className="space-y-2">
          {orders.map((o: any) => {
            const status = ORDER_STATUSES.find((s) => s.value === o.status)
            return (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <div>
                  <div className="font-medium text-sm">{o.order_number}</div>
                  <div className="text-xs text-surface-500">{o.user?.first_name} {o.user?.last_name} | {formatDate(o.created_at)}</div>
                </div>
                <div className="flex items-center gap-3">
                  {status && <span className={`badge-${status.color} text-xs`}>{status.label}</span>}
                  <span className="font-semibold text-sm">{formatCurrency(o.total)}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-surface-500 text-sm">
          <Clock className="mx-auto mb-2 text-surface-300" size={32} />
          No orders yet
        </div>
      )}
    </div>
  )
}

function LowStockAlerts() {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: async () => {
      const allProducts: Array<{
        id: string
        name: string
        slug: string
        stock_quantity: number
        low_stock_threshold: number
      }> = []
      let offset = 0

      while (true) {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, stock_quantity, low_stock_threshold')
          .eq('status', 'active')
          .order('stock_quantity', { ascending: true })
          .range(offset, offset + 999)
        if (error) throw new Error(error.message)
        allProducts.push(...(data || []))
        if (!data || data.length < 1000) break
        offset += 1000
      }

      return allProducts
        .filter((product) => product.stock_quantity <= product.low_stock_threshold)
        .sort((a, b) => a.stock_quantity - b.stock_quantity)
        .slice(0, 5)
    },
  })

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertTriangle size={18} className="text-warning-500" /> Low Stock Alerts
        </h3>
        <Link to="/admin/inventory" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
          View all <ArrowUpRight size={12} />
        </Link>
      </div>
      {isLoading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 mb-2" />)
      ) : isError ? (
        <ChartMessage message="Inventory alerts are unavailable." compact />
      ) : products && products.length > 0 ? (
        <div className="space-y-2">
          {products.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50">
              <div className="min-w-0">
                <Link to={`/product/${p.slug}`} className="font-medium text-sm hover:text-primary-600 truncate block">{p.name}</Link>
                <div className="text-xs text-surface-500">Threshold: {p.low_stock_threshold}</div>
              </div>
              <span className={`badge text-xs ${p.stock_quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                {p.stock_quantity} left
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-surface-500 text-sm">
          <Package className="mx-auto mb-2 text-surface-300" size={32} />
          All products well stocked
        </div>
      )}
    </div>
  )
}

// ===== Dashboard stats hook =====
function useDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 30_000,
  })
}

function useSalesData() {
  return useQuery({
    queryKey: ['admin-dashboard-sales', 'month'],
    queryFn: () => fetchSalesData('month'),
    staleTime: 30_000,
  })
}

function useOrderStatusData() {
  return useQuery({
    queryKey: ['admin-dashboard-order-status'],
    queryFn: fetchOrderStatusData,
    staleTime: 30_000,
  })
}

function ChartMessage({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center text-center text-sm text-surface-500 ${compact ? 'h-28' : 'h-[300px]'}`}>
      {message}
    </div>
  )
}

function formatChartDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function formatFullChartDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function formatCompactCurrency(value: number) {
  return `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`
}

const statToneClasses = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
  success: 'bg-success-50 text-success-600 dark:bg-success-900/20 dark:text-success-400',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-900/20 dark:text-warning-400',
  danger: 'bg-danger-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400',
}

const orderStatusColors: Record<string, string> = {
  pending: '#f59f00',
  paid: '#0b57d0',
  processing: '#4c6ef5',
  shipped: '#7048e8',
  delivered: '#12b886',
  cancelled: '#fa5252',
  refunded: '#868e96',
}
