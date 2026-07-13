// ===== User & Auth =====
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'employee' | 'customer'

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  created_at: string
  last_sign_in_at?: string
}

export interface Profile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  phone: string
  avatar_url?: string
  role: UserRole
  banned: boolean
  created_at: string
  updated_at: string
}

// ===== Product =====
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined
  children?: Category[]
  product_count?: number
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
  product_count?: number
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text?: string
  sort_order: number
  is_featured: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  sku: string
  barcode?: string
  price: number
  sale_price?: number
  cost_price?: number
  stock_quantity: number
  color?: string
  size?: string
  weight?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductStatus = 'active' | 'draft' | 'archived' | 'hidden'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_description?: string
  sku: string
  barcode?: string
  brand_id?: string
  cost_price: number
  selling_price: number
  sale_price?: number
  discount_percentage?: number
  stock_quantity: number
  low_stock_threshold: number
  weight?: number
  dimensions?: { length: number; width: number; height: number }
  seo_title?: string
  seo_description?: string
  status: ProductStatus
  is_featured: boolean
  is_new_arrival: boolean
  is_best_seller: boolean
  average_rating: number
  review_count: number
  total_sold: number
  created_at: string
  updated_at: string
  // Joined
  images?: ProductImage[]
  variants?: ProductVariant[]
  categories?: Category[]
  brand?: Brand
  tags?: string[]
}

// ===== Cart =====
export interface CartItem {
  id: string
  user_id: string
  product_id: string
  variant_id?: string
  quantity: number
  created_at: string
  updated_at: string
  // Joined
  product?: Product
  variant?: ProductVariant
}

// ===== Wishlist =====
export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  // Joined
  product?: Product
}

// ===== Address =====
export interface Address {
  id: string
  user_id: string
  label: string
  first_name: string
  last_name: string
  street_address_1: string
  street_address_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// ===== Order =====
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string
  product_name: string
  product_image?: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Order {
  id: string
  user_id: string | null
  guest_email?: string
  order_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method?: 'cash_on_delivery' | 'credit_card' | 'paypal' | 'bank_transfer'
  stock_deducted?: boolean
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  total: number
  coupon_id?: string
  shipping_method?: string
  shipping_address?: Address
  billing_address?: Address
  customer_note?: string
  internal_note?: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
  refunded_at?: string
  created_at: string
  updated_at: string
  // Joined
  items?: OrderItem[]
  user?: Profile
  coupon?: Coupon
}

// ===== Coupon =====
export type CouponType = 'percentage' | 'fixed' | 'free_shipping'

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  min_purchase?: number
  max_uses?: number
  used_count: number
  starts_at?: string
  expires_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ===== Review =====
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title?: string
  comment: string
  status: ReviewStatus
  admin_reply?: string
  created_at: string
  updated_at: string
  // Joined
  user?: Profile
  product?: Product
}

// ===== Inventory =====
export type InventoryAction = 'in' | 'out' | 'adjustment' | 'return'

export interface InventoryHistory {
  id: string
  product_id: string
  variant_id?: string
  action: InventoryAction
  quantity: number
  note?: string
  previous_stock: number
  new_stock: number
  created_by: string
  created_at: string
  // Joined
  product?: Product
  variant?: ProductVariant
}

// ===== Media =====
export type MediaType = 'image' | 'video' | 'pdf' | 'document'

export interface Media {
  id: string
  name: string
  url: string
  type: MediaType
  size: number
  folder?: string
  metadata?: Record<string, unknown>
  created_at: string
}

// ===== Settings =====
export interface Settings {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  updated_at: string
}

// ===== Notifications =====
export type NotificationType = 'order' | 'promotion' | 'system' | 'account'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  data?: Record<string, unknown>
  created_at: string
}

// ===== Dashboard Analytics =====
export interface DashboardStats {
  total_revenue: number
  total_orders: number
  total_customers: number
  total_products: number
  revenue_change: number
  orders_change: number
  customers_change: number
  products_change: number
}

export interface SalesDataPoint {
  date: string
  revenue: number
  orders: number
}

// ===== Filters & Pagination =====
export interface PaginationParams {
  page: number
  limit: number
}

export interface SortParams {
  sortBy: string
  sortDir: 'asc' | 'desc'
}

export interface ProductFilters {
  category_id?: string
  brand_id?: string
  min_price?: number
  max_price?: number
  color?: string
  size?: string
  search?: string
  is_featured?: boolean
  is_new_arrival?: boolean
  is_best_seller?: boolean
  status?: ProductStatus
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ===== Permission =====
export interface Permission {
  id: string
  name: string
  description: string
  module: string
}

export interface RolePermission {
  role: UserRole
  permission_id: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

// ===== API Response =====
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}
