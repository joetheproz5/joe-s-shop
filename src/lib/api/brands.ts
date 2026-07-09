import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { Brand } from '@/types'

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*, product_count:products(count)')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)

  return (data || []).map((row: Record<string, unknown>) => ({
    ...row,
    product_count: (row.product_count as { count: number }[] | null)?.[0]?.count ?? 0,
  })) as Brand[]
}

export async function fetchAllBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)

  return data as Brand[]
}

export async function fetchBrandBySlug(slug: string): Promise<Brand> {
  const { data, error } = await supabase
    .from('brands')
    .select('*, product_count:products(count)')
    .eq('slug', slug)
    .single()

  if (error) throw new Error(error.message)

  const brand = {
    ...data,
    product_count: (data.product_count as { count: number }[] | null)?.[0]?.count ?? 0,
  } as Brand

  return brand
}

export async function fetchBrandById(id: string): Promise<Brand> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)

  return data as Brand
}

export async function createBrand(data: Partial<Brand>): Promise<Brand> {
  const slug = data.slug || slugify(data.name || '')
  const { data: brand, error } = await supabase
    .from('brands')
    .insert({
      name: data.name,
      slug,
      logo_url: data.logo_url,
      description: data.description,
      is_active: data.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return brand as Brand
}

export async function updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
  if (data.name) {
    data.slug = data.slug || slugify(data.name)
  }

  const { data: brand, error } = await supabase
    .from('brands')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return brand as Brand
}

export async function deleteBrand(id: string): Promise<void> {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
