import { supabase } from '@/lib/supabase'
import type { DashboardStats, SalesDataPoint, Product } from '@/types'
import { ORDER_STATUSES } from '@/lib/constants'

const ANALYTICS_PAGE_SIZE = 1000

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100
  return Math.round((((current - previous) / previous) * 100) * 100) / 100
}

async function fetchRevenueTotals(currentPeriodStart: string, previousPeriodStart: string) {
  let offset = 0
  let total = 0
  let current = 0
  let previous = 0
  const currentPeriodStartMs = Date.parse(currentPeriodStart)
  const previousPeriodStartMs = Date.parse(previousPeriodStart)

  while (true) {
    const { data, error } = await supabase
      .from('orders')
      .select('total, created_at')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .range(offset, offset + ANALYTICS_PAGE_SIZE - 1)

    if (error) throw new Error(error.message)

    for (const order of data || []) {
      const amount = Number(order.total || 0)
      const createdAt = Date.parse(order.created_at)
      total += amount
      if (createdAt >= currentPeriodStartMs) current += amount
      else if (createdAt >= previousPeriodStartMs) previous += amount
    }

    if (!data || data.length < ANALYTICS_PAGE_SIZE) break
    offset += ANALYTICS_PAGE_SIZE
  }

  return { total, current, previous }
}

// ─────────────────────────────────────────────
// Dashboard Stats
// ─────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastPeriod = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const currentStart = startOfPeriod.toISOString()
  const previousStart = startOfLastPeriod.toISOString()

  const [
    revenue,
    totalOrdersRes,
    currentOrdersRes,
    previousOrdersRes,
    totalCustomersRes,
    currentCustomersRes,
    previousCustomersRes,
    totalProductsRes,
    currentProductsRes,
    previousProductsRes,
  ] = await Promise.all([
    fetchRevenueTotals(currentStart, previousStart),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', currentStart),
    supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', previousStart).lt('created_at', currentStart),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer').gte('created_at', currentStart),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer').gte('created_at', previousStart).lt('created_at', currentStart),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', currentStart),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', previousStart).lt('created_at', currentStart),
  ])

  const responses = [
    totalOrdersRes,
    currentOrdersRes,
    previousOrdersRes,
    totalCustomersRes,
    currentCustomersRes,
    previousCustomersRes,
    totalProductsRes,
    currentProductsRes,
    previousProductsRes,
  ]
  const failedResponse = responses.find((response) => response.error)
  if (failedResponse?.error) throw new Error(failedResponse.error.message)

  const currentOrders = currentOrdersRes.count ?? 0
  const previousOrders = previousOrdersRes.count ?? 0
  const currentCustomers = currentCustomersRes.count ?? 0
  const previousCustomers = previousCustomersRes.count ?? 0
  const currentProducts = currentProductsRes.count ?? 0
  const previousProducts = previousProductsRes.count ?? 0

  return {
    total_revenue: revenue.total,
    total_orders: totalOrdersRes.count ?? 0,
    total_customers: totalCustomersRes.count ?? 0,
    total_products: totalProductsRes.count ?? 0,
    revenue_change: percentageChange(revenue.current, revenue.previous),
    orders_change: percentageChange(currentOrders, previousOrders),
    customers_change: percentageChange(currentCustomers, previousCustomers),
    products_change: percentageChange(currentProducts, previousProducts),
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

  const orders: Array<{ created_at: string; total: number; id: string }> = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total, id')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', now.toISOString())
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: true })
      .range(offset, offset + ANALYTICS_PAGE_SIZE - 1)

    if (error) throw new Error(error.message)
    orders.push(...(data || []))
    if (!data || data.length < ANALYTICS_PAGE_SIZE) break
    offset += ANALYTICS_PAGE_SIZE
  }

  // Group by date
  const grouped = new Map<string, { revenue: number; orders: number }>()

  for (const order of orders) {
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

export interface OrderStatusDataPoint {
  status: string
  name: string
  value: number
}

export async function fetchOrderStatusData(): Promise<OrderStatusDataPoint[]> {
  const counts = new Map<string, number>()
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .order('created_at', { ascending: false })
      .range(offset, offset + ANALYTICS_PAGE_SIZE - 1)

    if (error) throw new Error(error.message)

    for (const order of data || []) {
      counts.set(order.status, (counts.get(order.status) || 0) + 1)
    }

    if (!data || data.length < ANALYTICS_PAGE_SIZE) break
    offset += ANALYTICS_PAGE_SIZE
  }

  return ORDER_STATUSES
    .map((status) => ({
      status: status.value,
      name: status.label,
      value: counts.get(status.value) || 0,
    }))
    .filter((status) => status.value > 0)
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
