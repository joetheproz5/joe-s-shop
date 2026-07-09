import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { generateOrderNumber } from '@/lib/utils'
import type {
  Order,
  OrderStatus,
  PaginatedResponse,
  PaginationParams,
  SortParams,
} from '@/types'

// ─────────────────────────────────────────────
// User's Orders
// ─────────────────────────────────────────────

export function useOrders(userId: string) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      return (data || []) as Order[]
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// ─────────────────────────────────────────────
// Single Order
// ─────────────────────────────────────────────

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async (): Promise<Order> => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', orderId)
        .single()

      if (error) throw new Error(error.message)

      return data as Order
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 2,
  })
}

// ─────────────────────────────────────────────
// Admin Orders (all orders with user join)
// ─────────────────────────────────────────────

interface AdminOrderFilters {
  status?: OrderStatus
  search?: string
}

export function useAdminOrders(
  filters: AdminOrderFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 },
  sort: SortParams = { sortBy: 'created_at', sortDir: 'desc' }
) {
  return useQuery({
    queryKey: ['admin-orders', filters, pagination, sort],
    queryFn: async (): Promise<PaginatedResponse<Order>> => {
      const from = (pagination.page - 1) * pagination.limit
      const to = from + pagination.limit - 1

      let query = supabase
        .from('orders')
        .select('*, items:order_items(*), user:profiles!orders_user_id_fkey(*)', {
          count: 'exact',
        })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.search) {
        query = query.or(
          `order_number.ilike.%${filters.search}%`
        )
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
    },
    staleTime: 1000 * 60 * 1,
  })
}

// ─────────────────────────────────────────────
// Create Order Mutation
// ─────────────────────────────────────────────

interface CreateOrderItem {
  product_id: string
  variant_id?: string
  product_name: string
  product_image?: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
}

interface CreateOrderInput {
  user_id: string
  items: CreateOrderItem[]
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

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderData: CreateOrderInput): Promise<Order> => {
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
        product_name: item.product_name,
        product_image: item.product_image ?? null,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw new Error(itemsError.message)

      return order as Order
    },
    onSuccess: (_data, variables) => {
      // Invalidate user's orders
      queryClient.invalidateQueries({ queryKey: ['orders', variables.user_id] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })
}
