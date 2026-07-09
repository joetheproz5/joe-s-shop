import { supabase } from '@/lib/supabase'
import type { DashboardStats, SalesDataPoint, Product } from '@/types'

// ─────────────────────────────────────────────
// Dashboard Stats
// ─────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastPeriod = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // Current period totals
  const [revenueRes, ordersRes, customersRes, productsRes] = await Promise.all([
    supabase
      .from('orders')
      .select('total')
      .gte('created_at', startOfPeriod.toISOString())
      .not('status', 'in', '("cancelled","refunded")'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfPeriod.toISOString()),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer'),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
  ])

  // Previous period totals for change calculation
  const [prevRevenueRes, prevOrdersRes, prevCustomersRes] = await Promise.all([
    supabase
      .from('orders')
      .select('total')
      .gte('created_at', startOfLastPeriod.toISOString())
      .lt('created_at', startOfPeriod.toISOString())
      .not('status', 'in', '("cancelled","refunded")'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfLastPeriod.toISOString())
      .lt('created_at', startOfPeriod.toISOString()),
    supabase
      .from('profiles')
      .select('id, created_at')
      .gte('created_at', startOfLastPeriod.toISOString())
      .lt('created_at', startOfPeriod.toISOString())
      .eq('role', 'customer'),
  ])

  const totalRevenue = revenueRes.data?.reduce((sum, o) => sum + (o.total || 0), 0) ?? 0
  const prevRevenue = prevRevenueRes.data?.reduce((sum, o) => sum + (o.total || 0), 0) ?? 0

  const totalOrders = ordersRes.count ?? 0
  const prevOrders = prevOrdersRes.count ?? 0

  const totalCustomers = customersRes.count ?? 0
  const newCustomers = prevCustomersRes.data?.length ?? 0

  const totalProducts = productsRes.count ?? 0

  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0
  const ordersChange = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0
  const customersChange = newCustomers > 0 ? (newCustomers / Math.max(totalCustomers - newCustomers, 1)) * 100 : 0
  const productsChange = 0 // No meaningful "change" for static count

  return {
    total_revenue: totalRevenue,
    total_orders: totalOrders,
    total_customers: totalCustomers,
    total_products: totalProducts,
    revenue_change: Math.round(revenueChange * 100) / 100,
    orders_change: Math.round(ordersChange * 100) / 100,
    customers_change: Math.round(customersChange * 100) / 100,
    products_change: productsChange,
  }
}

// ─────────────────────────────────────────────
// Sales Data
// ─────────────────────────────────────────────

export async function fetchSalesData(
  period: 'week' | 'month' | 'year' = 'month'
): Promise<SalesDataPoint[]> {
  const now = new Date()
  let startDate: Date

  if (period === 'week') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() + 1)
  } else {
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1)
  }

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total, id')
    .gte('created_at', startDate.toISOString())
    .lt('created_at', now.toISOString())
    .not('status', 'in', '("cancelled","refunded")')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  // Group by date
  const grouped = new Map<string, { revenue: number; orders: number }>()

  for (const order of data || []) {
    const date = order.created_at.split('T')[0]
    const existing = grouped.get(date) || { revenue: 0, orders: 0 }
    existing.revenue += order.total || 0
    existing.orders += 1
    grouped.set(date, existing)
  }

  // Fill in missing dates
  const result: SalesDataPoint[] = []
  const current = new Date(startDate)
  while (current <= now) {
    const dateStr = current.toISOString().split('T')[0]
    const entry = grouped.get(dateStr) || { revenue: 0, orders: 0 }
    result.push({
      date: dateStr,
      revenue: entry.revenue,
      orders: entry.orders,
    })
    current.setDate(current.getDate() + 1)
  }

  return result
}

// ─────────────────────────────────────────────
// Top Products
// ─────────────────────────────────────────────

export async function fetchTopProducts(limit: number = 10): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('status', 'active')
    .order('total_sold', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  return data as Product[]
}

// ─────────────────────────────────────────────
// Top Customers
// ─────────────────────────────────────────────

export interface TopCustomer {
  user_id: string
  email: string
  first_name: string
  last_name: string
  total_orders: number
  total_spent: number
}

export async function fetchTopCustomers(limit: number = 10): Promise<TopCustomer[]> {
  // Get all orders grouped by user
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('user_id, total')
    .not('status', 'in', '("cancelled","refunded")')

  if (ordersError) throw new Error(ordersError.message)

  // Aggregate
  const customerMap = new Map<string, { total: number; count: number }>()
  for (const order of orders || []) {
    const existing = customerMap.get(order.user_id) || { total: 0, count: 0 }
    existing.total += order.total || 0
    existing.count += 1
    customerMap.set(order.user_id, existing)
  }

  // Sort by total spent
  const sorted = Array.from(customerMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, limit)

  // Fetch profile info for each top customer
  const userIds = sorted.map(([userId]) => userId)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .in('id', userIds)

  if (profilesError) throw new Error(profilesError.message)

  const profileMap = new Map((profiles || []).map((p: { id: string; first_name: string; last_name: string }) => [p.id, p]))

  // Also get emails from auth users if possible
  return sorted.map(([userId, stats]) => {
    const profile = profileMap.get(userId)
    return {
      user_id: userId,
      email: '',
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      total_orders: stats.count,
      total_spent: stats.total,
    }
  })
}

// ─────────────────────────────────────────────
// Inventory Stats
// ─────────────────────────────────────────────

export interface InventoryStats {
  in_stock: number
  low_stock: number
  out_of_stock: number
}

export async function fetchInventoryStats(): Promise<InventoryStats> {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, stock_quantity, low_stock_threshold')
    .eq('status', 'active')

  if (error) throw new Error(error.message)

  let inStock = 0
  let lowStock = 0
  let outOfStock = 0

  for (const product of products || []) {
    if (product.stock_quantity <= 0) {
      outOfStock++
    } else if (product.stock_quantity <= product.low_stock_threshold) {
      lowStock++
    } else {
      inStock++
    }
  }

  return { in_stock: inStock, low_stock: lowStock, out_of_stock: outOfStock }
}
