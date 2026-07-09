import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useDebounce } from '@/hooks/useDebounce'
import type {
  Product,
  ProductFilters,
  PaginatedResponse,
  PaginationParams,
  SortParams,
} from '@/types'

// ─────────────────────────────────────────────
// Single Product
// ─────────────────────────────────────────────

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          images:product_images(*),
          variants:product_variants(*),
          categories:product_categories(categories(*)),
          brand:brands(*),
          tags:product_tags(tag)
        `
        )
        .eq('slug', slug)
        .eq('status', 'active')
        .single()

      if (error) throw new Error(error.message)

      return {
        ...data,
        tags: (data.tags as { tag: string }[] | null)?.map((t) => t.tag) ?? [],
        categories:
          (data.categories as { categories: Product['categories'] }[] | null)?.map(
            (c: { categories: unknown }) => c.categories
          ) ?? [],
      } as Product
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ─────────────────────────────────────────────
// Products List
// ─────────────────────────────────────────────

export function useProducts(
  filters: ProductFilters = {},
  pagination: PaginationParams = { page: 1, limit: 12 },
  sort: SortParams = { sortBy: 'created_at', sortDir: 'desc' }
) {
  return useQuery({
    queryKey: ['products', filters, pagination, sort],
    queryFn: async (): Promise<PaginatedResponse<Product>> => {
      const from = (pagination.page - 1) * pagination.limit
      const to = from + pagination.limit - 1

      let query = supabase
        .from('products')
        .select(
          `
          *,
          images:product_images(*),
          variants:product_variants(*),
          categories:product_categories(categories(*)),
          brand:brands(*),
          tags:product_tags(tag)
        `,
          { count: 'exact' }
        )
        .eq('status', 'active')

      // Filters
      if (filters.category_id) {
        query = query.contains('categories', [{ categories: { id: filters.category_id } }])
      }
      if (filters.brand_id) {
        query = query.eq('brand_id', filters.brand_id)
      }
      if (filters.min_price !== undefined) {
        query = query.gte('selling_price', filters.min_price)
      }
      if (filters.max_price !== undefined) {
        query = query.lte('selling_price', filters.max_price)
      }
      if (filters.color) {
        query = query.contains('colors', [filters.color])
      }
      if (filters.size) {
        query = query.contains('sizes', [filters.size])
      }
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
        )
      }
      if (filters.is_featured) {
        query = query.eq('is_featured', true)
      }
      if (filters.is_new_arrival) {
        query = query.eq('is_new_arrival', true)
      }
      if (filters.is_best_seller) {
        query = query.eq('is_best_seller', true)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      // Sort
      query = query.order(sort.sortBy, { ascending: sort.sortDir === 'asc' })

      // Pagination
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw new Error(error.message)

      const products: Product[] = (data || []).map((row: Record<string, unknown>) => ({
        ...row,
        tags: (row.tags as { tag: string }[] | null)?.map((t) => t.tag) ?? [],
        categories:
          (row.categories as { categories: unknown }[] | null)?.map(
            (c: { categories: unknown }) => c.categories
          ) ?? [],
      })) as Product[]

      return {
        data: products,
        total: count ?? 0,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil((count ?? 0) / pagination.limit),
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// ─────────────────────────────────────────────
// Featured Products
// ─────────────────────────────────────────────

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(
          `*, images:product_images(*), brand:brands(*)`
        )
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw new Error(error.message)

      return (data || []) as Product[]
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// ─────────────────────────────────────────────
// New Arrivals
// ─────────────────────────────────────────────

export function useNewArrivals(limit = 8) {
  return useQuery({
    queryKey: ['products', 'new-arrivals', limit],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(
          `*, images:product_images(*), brand:brands(*)`
        )
        .eq('status', 'active')
        .eq('is_new_arrival', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw new Error(error.message)

      return (data || []) as Product[]
    },
    staleTime: 1000 * 60 * 10,
  })
}

// ─────────────────────────────────────────────
// Best Sellers
// ─────────────────────────────────────────────

export function useBestSellers(limit = 8) {
  return useQuery({
    queryKey: ['products', 'best-sellers', limit],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(
          `*, images:product_images(*), brand:brands(*)`
        )
        .eq('status', 'active')
        .eq('is_best_seller', true)
        .order('total_sold', { ascending: false })
        .limit(limit)

      if (error) throw new Error(error.message)

      return (data || []) as Product[]
    },
    staleTime: 1000 * 60 * 10,
  })
}

// ─────────────────────────────────────────────
// Related Products
// ─────────────────────────────────────────────

export function useRelatedProducts(categoryId: string, excludeId: string) {
  return useQuery({
    queryKey: ['products', 'related', categoryId, excludeId],
    queryFn: async (): Promise<Product[]> => {
      // Get product IDs in the same category via the junction table
      const { data: junctionData, error: junctionError } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', categoryId)

      if (junctionError) throw new Error(junctionError.message)

      const productIds = (junctionData || []).map((j) => j.product_id).filter((id) => id !== excludeId)

      if (productIds.length === 0) return []

      const { data, error } = await supabase
        .from('products')
        .select(
          `*, images:product_images(*), brand:brands(*)`
        )
        .in('id', productIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) throw new Error(error.message)

      return (data || []) as Product[]
    },
    enabled: !!categoryId && !!excludeId,
    staleTime: 1000 * 60 * 10,
  })
}

// ─────────────────────────────────────────────
// Product Search (debounced)
// ─────────────────────────────────────────────

export function useProductSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300)

  return useQuery({
    queryKey: ['products', 'search', debouncedQuery],
    queryFn: async (): Promise<Product[]> => {
      if (!debouncedQuery.trim()) return []

      const { data, error } = await supabase
        .from('products')
        .select(
          `*, images:product_images(*)`
        )
        .eq('status', 'active')
        .or(
          `name.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%,sku.ilike.%${debouncedQuery}%`
        )
        .order('name', { ascending: true })
        .limit(20)

      if (error) throw new Error(error.message)

      return (data || []) as Product[]
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 2,
  })
}
