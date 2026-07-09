import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types'

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*, product_count:products(count)')
    .eq('is_active', true)
    .is('parent_id', null)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return (data || []).map((row: Record<string, unknown>) => ({
    ...row,
    product_count: (row.product_count as { count: number }[] | null)?.[0]?.count ?? 0,
  })) as Category[]
}

export async function fetchAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return data as Category[]
}

export async function fetchCategoryBySlug(slug: string): Promise<Category> {
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (catError) throw new Error(catError.message)

  // Fetch children
  const { data: children, error: childError } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', category.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (childError) throw new Error(childError.message)

  return { ...category, children: children || [] } as Category
}

export async function fetchCategoryById(id: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)

  return data as Category
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const slug = data.slug || slugify(data.name || '')
  const { data: category, error } = await supabase
    .from('categories')
    .insert({
      name: data.name,
      slug,
      description: data.description,
      image_url: data.image_url,
      parent_id: data.parent_id ?? null,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return category as Category
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  if (data.name) {
    data.slug = data.slug || slugify(data.name)
  }

  const { data: category, error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return category as Category
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

/**
 * Build a tree from a flat list of categories using parent_id.
 */
export function buildCategoryTree(categories: Category[]): Category[] {
  const map = new Map<string, Category>()
  const roots: Category[] = []

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] })
  }

  for (const cat of map.values()) {
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children!.push(cat)
    } else {
      roots.push(cat)
    }
  }

  return roots
}
