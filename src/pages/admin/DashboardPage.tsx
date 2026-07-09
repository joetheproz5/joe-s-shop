import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown,
  ArrowUpRight, AlertTriangle, Clock,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { Skeleton } from '@/components/ui'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  const cards = [
    { label: 'Total Revenue', value: formatCurrency(stats?.total_revenue || 0), change: stats?.revenue_change, icon: DollarSign, color: 'primary' },
    { label: 'Total Orders', value: formatNumber(stats?.total_orders || 0), change: stats?.orders_change, icon: ShoppingCart, color: 'success' },
    { label: 'Customers', value: formatNumber(stats?.total_customers || 0), change: stats?.customers_change, icon: Users, color: 'warning' },
    { label: 'Products', value: formatNumber(stats?.total_products || 0), change: stats?.products_change, icon: Package, color: 'danger' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-surface-500 text-sm mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${card.color}-50 dark:bg-${card.color}-900/20 text-${card.color}-600 dark:text-${card.color}-400`}>
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
            <span className="text-xs text-surface-500">Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5c7cfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5c7cfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-surface-700" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-surface-500" />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(0,0,0,0.05)',
                  fontSize: '13px',
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#5c7cfa" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Orders by status */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5">
          <h3 className="font-semibold mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {orderStatusData.map((entry, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
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
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at, user:profiles(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5)
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
      ) : orders && orders.length > 0 ? (
        <div className="space-y-2">
          {orders.map((o: any) => {
            const status = ORDER_STATUSES.find((s) => s.value === o.status)
            return (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <div>
                  <div className="font-medium text-sm">{o.order_number}</div>
                  <div className="text-xs text-surface-500">{o.user?.first_name} {o.user?.last_name} • {formatDate(o.created_at)}</div>
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
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, stock_quantity, low_stock_threshold')
        .eq('status', 'active')
        .lte('stock_quantity', 10)
        .order('stock_quantity', { ascending: true })
        .limit(5)
      return data || []
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
    queryFn: async () => {
      // Aggregate from multiple queries
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from('orders').select('total, created_at'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ])
      const totalRevenue = (ordersRes.data || []).reduce((sum: number, o: any) => sum + Number(o.total || 0), 0)
      return {
        total_revenue: totalRevenue,
        total_orders: ordersRes.data?.length || 0,
        total_products: productsRes.count || 0,
        total_customers: customersRes.count || 0,
        revenue_change: 12.5,
        orders_change: 8.3,
        customers_change: 15.2,
        products_change: 0,
      }
    },
  })
}

// Demo chart data (in production these come from the API)
const salesData = [
  { month: 'Jan', revenue: 12500, orders: 45 },
  { month: 'Feb', revenue: 15200, orders: 52 },
  { month: 'Mar', revenue: 18900, orders: 68 },
  { month: 'Apr', revenue: 16700, orders: 61 },
  { month: 'May', revenue: 22300, orders: 78 },
  { month: 'Jun', revenue: 28100, orders: 92 },
  { month: 'Jul', revenue: 31500, orders: 105 },
]

const orderStatusData = [
  { name: 'Pending', value: 12 },
  { name: 'Processing', value: 18 },
  { name: 'Shipped', value: 24 },
  { name: 'Delivered', value: 156 },
  { name: 'Cancelled', value: 5 },
]

const pieColors = ['#fcc419', '#5c7cfa', '#4c6ef5', '#20c997', '#fa5252']
