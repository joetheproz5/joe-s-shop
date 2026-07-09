import { supabase } from '@/lib/supabase'
import type {
  Review,
  ReviewStatus,
  PaginatedResponse,
  PaginationParams,
  SortParams,
} from '@/types'

// ─────────────────────────────────────────────
// Fetch
// ─────────────────────────────────────────────

export async function fetchReviews(
  productId: string
): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:profiles!reviews_user_id_fkey(*)')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data as Review[]
}

export async function fetchAdminReviews(
  filters: { status?: ReviewStatus; product_id?: string } = {},
  pagination: PaginationParams = { page: 1, limit: 20 },
  sort: SortParams = { sortBy: 'created_at', sortDir: 'desc' }
): Promise<PaginatedResponse<Review>> {
  const from = (pagination.page - 1) * pagination.limit
  const to = from + pagination.limit - 1

  let query = supabase
    .from('reviews')
    .select('*, user:profiles!reviews_user_id_fkey(*), product:products(id, name)', { count: 'exact' })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.product_id) {
    query = query.eq('product_id', filters.product_id)
  }

  query = query.order(sort.sortBy, { ascending: sort.sortDir === 'asc' })
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw new Error(error.message)

  return {
    data: (data || []) as Review[],
    total: count ?? 0,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil((count ?? 0) / pagination.limit),
  }
}

// ─────────────────────────────────────────────
// Create / Update / Delete
// ─────────────────────────────────────────────

export async function createReview(data: {
  product_id: string
  user_id: string
  rating: number
  title?: string
  comment: string
}): Promise<Review> {
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      product_id: data.product_id,
      user_id: data.user_id,
      rating: data.rating,
      title: data.title ?? null,
      comment: data.comment,
      status: 'pending',
    })
    .select('*, user:profiles!reviews_user_id_fkey(*)')
    .single()

  if (error) throw new Error(error.message)

  return review as Review
}

export async function updateReviewStatus(
  id: string,
  status: ReviewStatus,
  adminReply?: string
): Promise<Review> {
  const updates: Record<string, unknown> = { status }
  if (adminReply !== undefined) {
    updates.admin_reply = adminReply
  }

  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select('*, user:profiles!reviews_user_id_fkey(*), product:products(id, name)')
    .single()

  if (error) throw new Error(error.message)

  return data as Review
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
