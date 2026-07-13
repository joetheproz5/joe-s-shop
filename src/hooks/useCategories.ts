import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types'
import { buildCategoryTree } from '@/lib/api/categories'

// ─────────────────────────────────────────────
// All Categories (flat, with product_count)
// ─────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('sort_order', { ascending: true })

      if (error) throw new Error(error.message)

      return (data || []).map((row) => ({ ...row, product_count: 0 })) as Category[]
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// ─────────────────────────────────────────────
// Category Tree (nested structure)
// ─────────────────────────────────────────────

export function useCategoryTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw new Error(error.message)

      const flat = (data || []) as Category[]
      return buildCategoryTree(flat)
    },
    staleTime: 1000 * 60 * 30,
  })
}

// ─────────────────────────────────────────────
// Single Category with children
// ─────────────────────────────────────────────

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async (): Promise<Category> => {
      const { data: category, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (catError) throw new Error(catError.message)

      const { data: children, error: childError } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', category.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (childError) throw new Error(childError.message)

      return { ...category, children: children || [] } as Category
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 30,
  })
}
