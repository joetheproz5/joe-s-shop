import { supabase } from '@/lib/supabase'
import type { Coupon, PaginatedResponse, PaginationParams, SortParams } from '@/types'

// ─────────────────────────────────────────────
// Fetch
// ─────────────────────────────────────────────

export async function fetchCoupons(
  pagination: PaginationParams = { page: 1, limit: 20 },
  sort: SortParams = { sortBy: 'created_at', sortDir: 'desc' }
): Promise<PaginatedResponse<Coupon>> {
  const from = (pagination.page - 1) * pagination.limit
  const to = from + pagination.limit - 1

  const { data, error, count } = await supabase
    .from('coupons')
    .select('*', { count: 'exact' })
    .order(sort.sortBy, { ascending: sort.sortDir === 'asc' })
    .range(from, to)

  if (error) throw new Error(error.message)

  return {
    data: (data || []) as Coupon[],
    total: count ?? 0,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil((count ?? 0) / pagination.limit),
  }
}

export async function fetchCouponById(id: string): Promise<Coupon> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)

  return data as Coupon
}

export async function fetchCouponByCode(code: string): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(error.message)
  }

  return data as Coupon
}

// ─────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────

export async function createCoupon(data: Partial<Coupon>): Promise<Coupon> {
  const { data: coupon, error } = await supabase
    .from('coupons')
    .insert({
      code: data.code?.toUpperCase().trim(),
      type: data.type,
      value: data.value,
      min_purchase: data.min_purchase ?? null,
      max_uses: data.max_uses ?? null,
      used_count: 0,
      starts_at: data.starts_at ?? null,
      expires_at: data.expires_at ?? null,
      is_active: data.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return coupon as Coupon
}

export async function updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
  if (data.code) {
    data.code = data.code.toUpperCase().trim()
  }

  const { data: coupon, error } = await supabase
    .from('coupons')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return coupon as Coupon
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────
// Validate
// ─────────────────────────────────────────────

export interface CouponValidationResult {
  valid: boolean
  coupon?: Coupon
  error?: string
  discountAmount: number
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const coupon = await fetchCouponByCode(code)

  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code', discountAmount: 0 }
  }

  if (!coupon.is_active) {
    return { valid: false, error: 'This coupon is no longer active', discountAmount: 0 }
  }

  const now = new Date()

  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, error: 'This coupon is not yet available', discountAmount: 0 }
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, error: 'This coupon has expired', discountAmount: 0 }
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return { valid: false, error: 'This coupon has reached its usage limit', discountAmount: 0 }
  }

  if (coupon.min_purchase && subtotal < coupon.min_purchase) {
    return {
      valid: false,
      error: `Minimum purchase of $${coupon.min_purchase} required`,
      discountAmount: 0,
    }
  }

  let discountAmount = 0

  if (coupon.type === 'percentage') {
    discountAmount = Math.min(subtotal * (coupon.value / 100), subtotal)
  } else if (coupon.type === 'fixed') {
    discountAmount = Math.min(coupon.value, subtotal)
  } else if (coupon.type === 'free_shipping') {
    discountAmount = 0 // Shipping is handled separately
  }

  return { valid: true, coupon, discountAmount }
}
