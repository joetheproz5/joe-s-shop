const PRODUCT_SEARCH_COLUMNS = [
  'name',
  'short_description',
  'description',
  'sku',
  'slug',
] as const

const SEARCH_TERM_VARIANTS: Record<string, readonly string[]> = {
  plus: ['plus', '+'],
}

const SEARCH_TERM_FILTERS: Record<string, readonly string[]> = {
  apple: ['brand_id.eq.b1000000-0000-0000-0000-000000000001'],
  samsung: ['brand_id.eq.b1000000-0000-0000-0000-000000000002'],
}

export function normalizeSearchQuery(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\+/g, ' plus ')
    .replace(/([a-z]{2,})(\d)/gi, '$1 $2')
    .replace(/(\d)([a-z]{2,})/gi, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 80)
    .trim()
}

export function getSearchTerms(value: string): string[] {
  const normalized = normalizeSearchQuery(value)
  if (!normalized) return []

  return [...new Set(normalized.split(' ').filter(Boolean))].slice(0, 8)
}

export function buildProductSearchFilters(value: string): string[] {
  return getSearchTerms(value).map((term) => {
    const variants = SEARCH_TERM_VARIANTS[term] || [term]
    const textFilters = variants.flatMap((variant) =>
      PRODUCT_SEARCH_COLUMNS.map((column) => `${column}.ilike.%${variant}%`)
    )
    return [...textFilters, ...(SEARCH_TERM_FILTERS[term] || [])].join(',')
  })
}
