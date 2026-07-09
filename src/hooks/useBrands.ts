import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Brand } from '@/types'

// ─────────────────────────────────────────────
// All Brands
// ─────────────────────────────────────────────

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async (): Promise<Brand[]> => {
      const { data, error } = await supabase
        .from('brands')
        .select('*, product_count:products(count)')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw new Error(error.message)

      return (data || []).map((row: Record<string, unknown>) => ({
        ...row,
        product_count:
          (row.product_count as { count: number }[] | null)?.[0]?.count ?? 0,
      })) as Brand[]
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// ─────────────────────────────────────────────
// Single Brand
// ─────────────────────────────────────────────

export function useBrand(slug: string) {
  return useQuery({
    queryKey: ['brand', slug],
    queryFn: async (): Promise<Brand> => {
      const { data, error } = await supabase
        .from('brands')
        .select('*, product_count:products(count)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) throw new Error(error.message)

      return {
        ...data,
        product_count:
          (data.product_count as { count: number }[] | null)?.[0]?.count ?? 0,
      } as Brand
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 30,
  })
}
