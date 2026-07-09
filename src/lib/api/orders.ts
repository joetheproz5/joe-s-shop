import { supabase } from '@/lib/supabase'
import { generateOrderNumber } from '@/lib/utils'
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaginatedResponse,
  PaginationParams,
  SortParams,
} from '@/types'

// ─────────────────────────────────────────────
// Fetch
// ─────────────────────────────────────────────

export async function fetchOrders(
  userId: string
): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data as Order[]
}

export async function fetchOrderById(orderId: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .single()

  if (error) throw new Error(error.message)

  return data as Order
}

export async function fetchOrderByNumber(orderNumber: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('order_number', orderNumber)
    .single()

  if (error) throw new Error(error.message)

  return data as Order
}

export async function fetchAdminOrders(
  filters: { status?: OrderStatus; search?: string } = {},
  pagination: PaginationParams = { page: 1, limit: 20 },
  sort: SortParams = { sortBy: 'created_at', sortDir: 'desc' }
): Promise<PaginatedResponse<Order>> {
  const from = (pagination.page - 1) * pagination.limit
  const to = from + pagination.limit - 1

  let query = supabase
    .from('orders')
    .select('*, items:order_items(*), user:profiles!orders_user_id_fkey(*)', { count: 'exact' })

  if ((filters as Record<string, unknown>).status) {
    query = query.eq('status', (filters as Record<string, unknown>).status)
  }
  if ((filters as Record<string, unknown>).search) {
    query = query.or(`order_number.ilike.%${(filters as Record<string, unknown>).search}%`)
  }

  query = query.order(sort.sortBy, { ascending: sort.sortDir === 'asc' })
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw new Error(error.message)

  return {
    data: (data || []) as Order[],
    total: count ?? 0,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil((count ?? 0) / pagination.limit),
  }
}

// ─────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────

export interface CreateOrderData {
  user_id: string
  items: {
    product_id: string
    variant_id?: string
    quantity: number
    unit_price: number
  }[]
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  total: number
  coupon_id?: string
  shipping_method?: string
  shipping_address?: Record<string, unknown>
  billing_address?: Record<string, unknown>
  customer_note?: string
}

export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  const orderNumber = generateOrderNumber()

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.user_id,
      order_number: orderNumber,
      status: 'pending' as OrderStatus,
      payment_status: 'pending' as const,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      shipping_cost: orderData.shipping_cost,
      discount: orderData.discount,
      total: orderData.total,
      coupon_id: orderData.coupon_id ?? null,
      shipping_method: orderData.shipping_method ?? null,
      shipping_address: orderData.shipping_address ?? null,
      billing_address: orderData.billing_address ?? null,
      customer_note: orderData.customer_note ?? null,
    })
    .select()
    .single()

  if (orderError) throw new Error(orderError.message)

  // Insert order items
  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id ?? null,
    product_name: '', // will be updated via trigger or separately
    sku: '',
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.unit_price * item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw new Error(itemsError.message)

  // Populate product names for order items
  for (const item of orderData.items) {
    const { data: product } = await supabase
      .from('products')
      .select('name, sku')
      .eq('id', item.product_id)
      .single()

    if (product) {
      const variantMatch = item.variant_id
        ? orderItems.find((i) => i.variant_id === item.variant_id)
        : null

      await supabase
        .from('order_items')
        .update({
          product_name: product.name,
          sku: product.sku,
        })
        .eq('order_id', order.id)
        .eq('product_id', item.product_id)
    }
  }

  return order as Order
}

// ─────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  internalNote?: string
): Promise<Order> {
  const updates: Record<string, unknown> = { status }

  // Set timestamp fields based on status
  if (status === 'paid') updates.paid_at = new Date().toISOString()
  if (status === 'shipped') updates.shipped_at = new Date().toISOString()
  if (status === 'delivered') updates.delivered_at = new Date().toISOString()
  if (status === 'cancelled') updates.cancelled_at = new Date().toISOString()
  if (status === 'refunded') {
    updates.refunded_at = new Date().toISOString()
    updates.payment_status = 'refunded'
  }
  if (internalNote) updates.internal_note = internalNote

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return data as Order
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status: paymentStatus,
      ...(paymentStatus === 'paid' ? { paid_at: new Date().toISOString() } : {}),
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return data as Order
}
