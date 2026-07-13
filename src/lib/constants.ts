export const SITE_NAME = 'The Tech Shelf'
export const SITE_DESCRIPTION = 'Phones, laptops, audio, wearables, and accessories for Lebanon.'
export const SITE_URL = 'https://joetheproz5.github.io/joe-s-shop'

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'paid', label: 'Paid', color: 'primary' },
  { value: 'processing', label: 'Processing', color: 'primary' },
  { value: 'shipped', label: 'Shipped', color: 'primary' },
  { value: 'delivered', label: 'Delivered', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'danger' },
  { value: 'refunded', label: 'Refunded', color: 'danger' },
] as const

export const PRODUCT_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'draft', label: 'Draft', color: 'warning' },
  { value: 'hidden', label: 'Hidden', color: 'warning' },
  { value: 'archived', label: 'Archived', color: 'danger' },
] as const

export const ROLES = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full access to everything' },
  { value: 'admin', label: 'Admin', description: 'Access to most features' },
  { value: 'manager', label: 'Manager', description: 'Manage products, orders, customers' },
  { value: 'employee', label: 'Employee', description: 'Limited access to specific areas' },
  { value: 'customer', label: 'Customer', description: 'Shop and manage own account' },
] as const

export const REVIEW_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'danger' },
] as const

export const COUPON_TYPES = [
  { value: 'percentage', label: 'Percentage', description: 'Discount by percentage' },
  { value: 'fixed', label: 'Fixed Amount', description: 'Fixed discount amount' },
  { value: 'free_shipping', label: 'Free Shipping', description: 'Waive shipping fee' },
] as const

export const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
] as const

export const PRODUCT_COLORS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow',
  'Purple', 'Orange', 'Pink', 'Brown', 'Gray', 'Navy',
  'Beige', 'Gold', 'Silver', 'Teal',
] as const

export const PRODUCT_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL',
  'One Size',
] as const

export const ITEMS_PER_PAGE = 12
export const ADMIN_ITEMS_PER_PAGE = 20

export const STORAGE_BUCKETS = {
  products: 'product-images',
  categories: 'category-images',
  brands: 'brand-logos',
  media: 'media-library',
  avatars: 'avatars',
} as const
