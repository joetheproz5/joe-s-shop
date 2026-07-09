import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Review, ReviewStatus } from '@/types'

export function useReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', 'product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, user:profiles(first_name, last_name, avatar_url)')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as (Review & {
        user: { first_name: string; last_name: string; avatar_url: string | null }
      })[]
    },
    enabled: !!productId,
  })
}

export function useAdminReviews(filters: { status?: ReviewStatus; search?: string } = {}) {
  return useQuery({
    queryKey: ['admin-reviews', filters],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('*, product:products(id, name, slug), user:profiles(first_name, last_name)')
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.search) query = query.or(`comment.ilike.%${filters.search}%,title.ilike.%${filters.search}%`)
      query = query.order('created_at', { ascending: false })
      const { data, error } = await query
      if (error) throw error
      return data as unknown as Review[]
    },
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      product_id: string
      user_id: string
      rating: number
      title?: string
      comment: string
    }) => {
      const { data, error } = await supabase.from('reviews').insert(payload).select().single()
      if (error) throw error
      return data as Review
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['reviews', 'product', variables.product_id] })
    },
  })
}

export function useUpdateReviewStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string; status: ReviewStatus; admin_reply?: string }) => {
      const updates: Record<string, unknown> = { status: payload.status }
      if (payload.admin_reply !== undefined) updates.admin_reply = payload.admin_reply
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', payload.id)
        .select()
        .single()
      if (error) throw error
      return data as Review
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reviews'] })
      qc.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reviews'] })
      qc.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
