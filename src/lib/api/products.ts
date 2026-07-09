import { supabase } from '@/lib/supabase'
import { STORAGE_BUCKETS } from '@/lib/constants'
import { slugify } from '@/lib/utils'
import type {
  Product,
  ProductFilters,
  PaginatedResponse,
  PaginationParams,
  SortParams,
  ProductImage,
} from '@/types'

// ─────────────────────────────────────────────
// Fetch
// ─────────────────────────────────────────────

export async function fetchProducts(
  filters: ProductFilters = {},
  pagination: PaginationParams = { page: 1, limit: 12 },
  sort: SortParams = { sortBy: 'created_at', sortDir: 'desc' }
): Promise<PaginatedResponse<Product>> {
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
    query = query.eq('product_categories.category_id', filters.category_id)
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
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
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
    categories: (row.categories as { categories: Product['categories'] }[] | null)?.map(
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
}

export async function fetchAdminProducts(
  filters: ProductFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 },
  sort: SortParams = { sortBy: 'created_at', sortDir: 'desc' }
): Promise<PaginatedResponse<Product>> {
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

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.brand_id) query = query.eq('brand_id', filters.brand_id)
  if (filters.min_price !== undefined) query = query.gte('selling_price', filters.min_price)
  if (filters.max_price !== undefined) query = query.lte('selling_price', filters.max_price)
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
  }
  if (filters.is_featured) query = query.eq('is_featured', true)
  if (filters.is_new_arrival) query = query.eq('is_new_arrival', true)
  if (filters.is_best_seller) query = query.eq('is_best_seller', true)

  query = query.order(sort.sortBy, { ascending: sort.sortDir === 'asc' }).range(from, to)

  const { data, error, count } = await query

  if (error) throw new Error(error.message)

  let products = ((data || []).map((row: Record<string, unknown>) => ({
    ...row,
    tags: (row.tags as { tag: string }[] | null)?.map((t) => t.tag) ?? [],
    categories: (row.categories as { categories: unknown }[] | null)?.map(
      (c: { categories: unknown }) => c.categories
    ) ?? [],
  })) as Product[])

  if (filters.category_id) {
    products = products.filter((product) =>
      product.categories?.some((category) => category.id === filters.category_id)
    )
  }

  return {
    data: products,
    total: count ?? products.length,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil((count ?? products.length) / pagination.limit),
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
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
    .single()

  if (error) throw new Error(error.message)

  const product = {
    ...data,
    tags: (data.tags as { tag: string }[] | null)?.map((t) => t.tag) ?? [],
    categories: (data.categories as { categories: unknown }[] | null)?.map(
      (c: { categories: unknown }) => c.categories
    ) ?? [],
  } as Product

  return product
}

// ─────────────────────────────────────────────
// Create / Update / Delete
// ─────────────────────────────────────────────

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const slug = data.slug || slugify(data.name || '')
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: data.name,
      slug,
      description: data.description,
      short_description: data.short_description,
      sku: data.sku,
      barcode: data.barcode,
      brand_id: data.brand_id,
      cost_price: data.cost_price,
      selling_price: data.selling_price,
      sale_price: data.sale_price,
      discount_percentage: data.discount_percentage,
      stock_quantity: data.stock_quantity,
      low_stock_threshold: data.low_stock_threshold,
      weight: data.weight,
      dimensions: data.dimensions,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      status: data.status || 'draft',
      is_featured: data.is_featured ?? false,
      is_new_arrival: data.is_new_arrival ?? false,
      is_best_seller: data.is_best_seller ?? false,
      colors: data.colors,
      sizes: data.sizes,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return product as Product
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  if (data.name) {
    data.slug = data.slug || slugify(data.name)
  }

  const { data: product, error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return product as Product
}

export async function syncProductCategories(productId: string, categoryIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('product_categories')
    .delete()
    .eq('product_id', productId)

  if (deleteError) throw new Error(deleteError.message)

  if (categoryIds.length === 0) return

  const { error } = await supabase
    .from('product_categories')
    .insert(categoryIds.map((categoryId) => ({ product_id: productId, category_id: categoryId })))

  if (error) throw new Error(error.message)
}

export async function syncProductTags(productId: string, tags: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('product_tags')
    .delete()
    .eq('product_id', productId)

  if (deleteError) throw new Error(deleteError.message)

  const cleanedTags = tags.map((tag) => tag.trim()).filter(Boolean)
  if (cleanedTags.length === 0) return

  const { error } = await supabase
    .from('product_tags')
    .insert(cleanedTags.map((tag) => ({ product_id: productId, tag })))

  if (error) throw new Error(error.message)
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ status: 'archived' })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function duplicateProduct(id: string): Promise<Product> {
  // Fetch original
  const { data: original, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at, updated_at, total_sold, average_rating, review_count, ...copyData } = original

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      ...copyData,
      name: `${original.name}-copy`,
      slug: `${original.slug}-copy-${Date.now()}`,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return product as Product
}

// ─────────────────────────────────────────────
// Bulk operations
// ─────────────────────────────────────────────

export async function bulkUpdateProducts(
  ids: string[],
  data: Partial<Product>
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(data)
    .in('id', ids)

  if (error) throw new Error(error.message)
}

export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ status: 'archived' })
    .in('id', ids)

  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────
// CSV Import / Export
// ─────────────────────────────────────────────

export async function importProductsFromCSV(file: File): Promise<{ imported: number; errors: string[] }> {
  const text = await file.text()
  const rows = text.split('\n').slice(1) // skip header

  const errors: string[] = []
  let imported = 0

  for (let i = 0; i < rows.length; i++) {
    const cols = rows[i].split(',').map((c) => c.trim())
    if (cols.length < 5) {
      errors.push(`Row ${i + 2}: insufficient columns`)
      continue
    }

    const [name, sku, costPrice, sellingPrice, stockQty, ...rest] = cols

    const { error } = await supabase.from('products').insert({
      name,
      sku,
      cost_price: parseFloat(costPrice) || 0,
      selling_price: parseFloat(sellingPrice) || 0,
      stock_quantity: parseInt(stockQty, 10) || 0,
      status: 'draft',
      slug: slugify(name + '-' + Date.now() + '-' + i),
    })

    if (error) {
      errors.push(`Row ${i + 2}: ${error.message}`)
    } else {
      imported++
    }
  }

  return { imported, errors }
}

export async function exportProductsToCSV(
  filters: ProductFilters = {}
): Promise<string> {
  let query = supabase
    .from('products')
    .select('id, name, slug, sku, brand_id, cost_price, selling_price, sale_price, stock_quantity, status, is_featured, is_new_arrival, is_best_seller')
    .order('name', { ascending: true })

  if (filters.category_id) {
    query = query.eq('product_categories.category_id', filters.category_id)
  }
  if (filters.brand_id) {
    query = query.eq('brand_id', filters.brand_id)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  const header = 'ID,Name,SKU,Cost Price,Selling Price,Sale Price,Stock,Status,Featured,New Arrival,Best Seller'
  const rows = (data || []).map((row: Record<string, unknown>) =>
    [
      row.id,
      `"${(row.name as string).replace(/"/g, '""')}"`,
      row.sku,
      row.cost_price,
      row.selling_price,
      row.sale_price ?? '',
      row.stock_quantity,
      row.status,
      row.is_featured,
      row.is_new_arrival,
      row.is_best_seller,
    ].join(',')
  )

  return [header, ...rows].join('\n')
}

// ─────────────────────────────────────────────
// Image operations
// ─────────────────────────────────────────────

export async function uploadProductImages(
  productId: string,
  files: File[]
): Promise<ProductImage[]> {
  const bucket = STORAGE_BUCKETS.products
  const uploaded: ProductImage[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const ext = file.name.split('.').pop()
    const path = `${productId}/${Date.now()}-${i}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      console.error(`Failed to upload ${file.name}:`, uploadError.message)
      continue
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)

    const { data: imageData, error: insertError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: urlData.publicUrl,
        alt_text: file.name.replace(/\.[^.]+$/, ''),
        sort_order: i,
        is_featured: i === 0,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to insert image record:', insertError.message)
      continue
    }

    uploaded.push(imageData as ProductImage)
  }

  return uploaded
}

export async function reorderProductImages(imageIds: string[]): Promise<void> {
  const updates = imageIds.map((id, index) =>
    supabase
      .from('product_images')
      .update({ sort_order: index })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const firstError = results.find((r) => r.error)
  if (firstError?.error) throw new Error(firstError.error.message)
}
