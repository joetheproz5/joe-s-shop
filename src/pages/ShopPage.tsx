import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, Grid3x3, List, ChevronDown, Star } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useBrands } from '@/hooks/useBrands'
import { ProductCard } from '@/components/shop/ProductCard'
import { Pagination, Skeleton, Button } from '@/components/ui'
import { ITEMS_PER_PAGE, PRODUCT_COLORS } from '@/lib/constants'
import { clsx } from '@/lib/utils'
import type { Brand, Category, ProductFilters, SortParams } from '@/types'

const SORTS: { value: string; label: string; sortBy: string; sortDir: 'asc' | 'desc' }[] = [
  { value: 'newest', label: 'Newest', sortBy: 'created_at', sortDir: 'desc' },
  { value: 'price_asc', label: 'Price: Low to High', sortBy: 'selling_price', sortDir: 'asc' },
  { value: 'price_desc', label: 'Price: High to Low', sortBy: 'selling_price', sortDir: 'desc' },
  { value: 'name', label: 'Name: A to Z', sortBy: 'name', sortDir: 'asc' },
  { value: 'rating', label: 'Top Rated', sortBy: 'average_rating', sortDir: 'desc' },
]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  // Read state from URL
  const page = parseInt(searchParams.get('page') || '1', 10)
  const sortValue = searchParams.get('sort') || 'newest'
  const search = searchParams.get('search') || ''
  const categoryIds = searchParams.getAll('category').filter(Boolean)
  const brandIds = searchParams.getAll('brand').filter(Boolean)
  const minPrice = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined
  const maxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined
  const color = searchParams.get('color') || undefined

  const { data: categories } = useCategories()
  const { data: brands } = useBrands()

  const filters: ProductFilters = useMemo(() => ({
    category_id: categoryIds[0],
    brand_id: brandIds[0],
    min_price: minPrice,
    max_price: maxPrice,
    color,
    search,
    is_featured: searchParams.get('is_featured') === 'true' || undefined,
    is_new_arrival: searchParams.get('is_new_arrival') === 'true' || undefined,
    is_best_seller: searchParams.get('is_best_seller') === 'true' || undefined,
  }), [categoryIds, brandIds, minPrice, maxPrice, color, search, searchParams])

  const sort: SortParams = useMemo(() => {
    const s = SORTS.find((x) => x.value === sortValue) || SORTS[0]
    return { sortBy: s.sortBy, sortDir: s.sortDir }
  }, [sortValue])

  const { data, isLoading } = useProducts(filters, { page, limit: ITEMS_PER_PAGE }, sort)

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
    next.delete('page')
    setSearchParams(next)
  }

  const toggleArrayParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    const current = next.getAll(key)
    next.delete(key)
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    updated.forEach((v) => next.append(key, v))
    next.delete('page')
    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams(new URLSearchParams())

  const activeFilterCount = [
    ...categoryIds, ...brandIds,
    minPrice, maxPrice, color, search,
    searchParams.get('is_featured'), searchParams.get('is_new_arrival'), searchParams.get('is_best_seller'),
  ].filter(Boolean).length

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <nav className="text-sm text-surface-500 mb-2">
          <span>Home</span> <span className="mx-1">/</span> <span className="text-surface-900 dark:text-surface-50">Shop</span>
        </nav>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Shop All Products</h1>
            <p className="text-surface-500 mt-1">{data?.total || 0} products available</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortValue}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="input-field appearance-none pr-9 py-2 text-sm cursor-pointer"
              >
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
            </div>
            {/* View toggle */}
            <div className="hidden sm:flex border border-surface-300 dark:border-surface-700 rounded-xl overflow-hidden">
              <button onClick={() => setView('grid')} className={clsx('p-2.5', view === 'grid' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-surface-500')}>
                <Grid3x3 size={18} />
              </button>
              <button onClick={() => setView('list')} className={clsx('p-2.5', view === 'list' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-surface-500')}>
                <List size={18} />
              </button>
            </div>
            {/* Mobile filter button */}
            <button onClick={() => setShowFilters(true)} className="lg:hidden btn-secondary py-2">
              <SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 && <span className="ml-1 badge-primary">{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar filters — desktop */}
        <aside className="hidden lg:block">
          <FilterPanel
            categories={categories || []}
            brands={brands || []}
            categoryIds={categoryIds}
            brandIds={brandIds}
            minPrice={minPrice}
            maxPrice={maxPrice}
            color={color}
            search={search}
            onToggleCategory={(v) => toggleArrayParam('category', v)}
            onToggleBrand={(v) => toggleArrayParam('brand', v)}
            onPriceChange={(min, max) => { updateParam('min_price', min ? String(min) : null); updateParam('max_price', max ? String(max) : null) }}
            onColorChange={(v) => updateParam('color', v)}
            onClear={clearFilters}
            activeCount={activeFilterCount}
          />
        </aside>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30 }}
                className="lg:hidden fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-surface-900 z-50 overflow-y-auto p-5"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2"><X size={20} /></button>
                </div>
                <FilterPanel
                  categories={categories || []}
                  brands={brands || []}
                  categoryIds={categoryIds}
                  brandIds={brandIds}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  color={color}
                  search={search}
                  onToggleCategory={(v) => toggleArrayParam('category', v)}
                  onToggleBrand={(v) => toggleArrayParam('brand', v)}
                  onPriceChange={(min, max) => { updateParam('min_price', min ? String(min) : null); updateParam('max_price', max ? String(max) : null) }}
                  onColorChange={(v) => updateParam('color', v)}
                  onClear={clearFilters}
                  activeCount={activeFilterCount}
                />
                <Button fullWidth onClick={() => setShowFilters(false)} className="mt-6">Show Results</Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product grid */}
        <div>
          {isLoading ? (
            <div className={clsx('grid gap-4', view === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} variant="card" />)}
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <SlidersHorizontal className="text-surface-400" size={28} />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-surface-500 mb-6">Try adjusting your filters or search terms.</p>
              <Button onClick={clearFilters} variant="secondary">Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className={clsx('grid gap-4', view === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
                {data.data.map((p, i) => <ProductCard key={p.id} product={p} index={i} variant={view === 'list' ? 'compact' : 'default'} />)}
              </div>
              {data.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={data.page}
                    totalPages={data.totalPages}
                    totalItems={data.total}
                    pageSize={data.limit}
                    onPageChange={(p) => { updateParam('page', p > 1 ? String(p) : null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface FilterPanelProps {
  categories: Category[]
  brands: Brand[]
  categoryIds: string[]
  brandIds: string[]
  minPrice?: number
  maxPrice?: number
  color?: string
  search: string
  onToggleCategory: (value: string) => void
  onToggleBrand: (value: string) => void
  onPriceChange: (min: number, max: number) => void
  onColorChange: (value: string) => void
  onClear: () => void
  activeCount: number
}

function FilterPanel({ categories, brands, categoryIds, brandIds, minPrice, maxPrice, color, onToggleCategory, onToggleBrand, onPriceChange, onColorChange, onClear, activeCount }: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {activeCount > 0 && (
        <button onClick={onClear} className="text-sm text-danger-500 hover:underline flex items-center gap-1">
          <X size={14} /> Clear all ({activeCount})
        </button>
      )}

      {/* Categories */}
      <FilterGroup title="Category">
        {(categories || []).filter((category) => !category.parent_id).map((cat) => (
          <label key={cat.id} className="flex items-center gap-2 py-1 cursor-pointer hover:text-primary-600">
            <input
              type="checkbox"
              checked={categoryIds.includes(cat.id)}
              onChange={() => onToggleCategory(cat.id)}
              className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm">{cat.name}</span>
            <span className="ml-auto text-xs text-surface-400">{cat.product_count}</span>
          </label>
        ))}
      </FilterGroup>

      {/* Brands */}
      <FilterGroup title="Brand">
        {(brands || []).map((brand) => (
          <label key={brand.id} className="flex items-center gap-2 py-1 cursor-pointer hover:text-primary-600">
            <input
              type="checkbox"
              checked={brandIds.includes(brand.id)}
              onChange={() => onToggleBrand(brand.id)}
              className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm">{brand.name}</span>
          </label>
        ))}
      </FilterGroup>

      {/* Price */}
      <FilterGroup title="Price">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice || ''}
            onChange={(e) => onPriceChange(Number(e.target.value) || 0, maxPrice || 0)}
            className="input-field py-1.5 text-sm"
          />
          <span className="text-surface-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice || ''}
            onChange={(e) => onPriceChange(minPrice || 0, Number(e.target.value) || 0)}
            className="input-field py-1.5 text-sm"
          />
        </div>
      </FilterGroup>

      {/* Colors */}
      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {PRODUCT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(color === c ? '' : c)}
              title={c}
              className={clsx(
                'w-8 h-8 rounded-full border-2 transition-all',
                color === c ? 'border-primary-600 scale-110' : 'border-surface-200 dark:border-surface-700'
              )}
              style={{ backgroundColor: colorNameToHex(c) }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Rating">
        {[5, 4, 3].map((r) => (
          <button key={r} className="flex items-center gap-1 py-1 text-sm text-surface-500 hover:text-primary-600">
            {Array.from({ length: r }).map((_, i) => <Star key={i} size={13} className="text-warning-500" fill="currentColor" />)}
            <span>& up</span>
          </button>
        ))}
      </FilterGroup>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-surface-200 dark:border-surface-800 pb-5">
      <h3 className="font-semibold text-sm uppercase tracking-wide text-surface-700 dark:text-surface-300 mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function colorNameToHex(name: string): string {
  const map: Record<string, string> = {
    Black: '#000000', White: '#ffffff', Red: '#ef4444', Blue: '#3b82f6', Green: '#22c55e',
    Yellow: '#eab308', Purple: '#a855f7', Orange: '#f97316', Pink: '#ec4899', Brown: '#92400e',
    Gray: '#6b7280', Navy: '#1e3a8a', Beige: '#d4b896', Gold: '#fbbf24', Silver: '#cbd5e1', Teal: '#14b8a6',
  }
  return map[name] || '#cccccc'
}
