import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  ArchiveRestore,
  Boxes,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileUp,
  ImagePlus,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { Button, Input, Modal, ModalBody, ModalFooter, Select } from '@/components/ui'
import {
  bulkUpdateProducts,
  createProduct,
  deleteProduct,
  duplicateProduct,
  exportProductsToCSV,
  fetchAdminProducts,
  importProductsFromCSV,
  syncProductCategories,
  syncProductTags,
  updateProduct,
  uploadProductImages,
} from '@/lib/api/products'
import { fetchAllCategories } from '@/lib/api/categories'
import { fetchAllBrands } from '@/lib/api/brands'
import { ADMIN_ITEMS_PER_PAGE, PRODUCT_STATUSES } from '@/lib/constants'
import { formatCurrency, formatDate, getStockStatus, slugify } from '@/lib/utils'
import type { Brand, Category, Product, ProductStatus } from '@/types'
import { AdminMetricCard, AdminPageHeader, AdminToolbar, EmptyAdminState, StatusPill } from './AdminPrimitives'

type ProductFormState = {
  name: string
  slug: string
  sku: string
  barcode: string
  brand_id: string
  category_ids: string[]
  tags: string
  short_description: string
  description: string
  cost_price: string
  selling_price: string
  sale_price: string
  discount_percentage: string
  stock_quantity: string
  low_stock_threshold: string
  weight: string
  seo_title: string
  seo_description: string
  status: ProductStatus
  is_featured: boolean
  is_new_arrival: boolean
  is_best_seller: boolean
}

const defaultForm: ProductFormState = {
  name: '',
  slug: '',
  sku: '',
  barcode: '',
  brand_id: '',
  category_ids: [],
  tags: '',
  short_description: '',
  description: '',
  cost_price: '0',
  selling_price: '0',
  sale_price: '',
  discount_percentage: '0',
  stock_quantity: '0',
  low_stock_threshold: '5',
  weight: '',
  seo_title: '',
  seo_description: '',
  status: 'draft',
  is_featured: false,
  is_new_arrival: false,
  is_best_seller: false,
}

const statusTone: Record<ProductStatus, 'success' | 'warning' | 'danger' | 'surface'> = {
  active: 'success',
  draft: 'warning',
  hidden: 'surface',
  archived: 'danger',
}

function productToForm(product: Product): ProductFormState {
  return {
    name: product.name ?? '',
    slug: product.slug ?? '',
    sku: product.sku ?? '',
    barcode: product.barcode ?? '',
    brand_id: product.brand_id ?? '',
    category_ids: product.categories?.map((category) => category.id) ?? [],
    tags: product.tags?.join(', ') ?? '',
    short_description: product.short_description ?? '',
    description: product.description ?? '',
    cost_price: String(product.cost_price ?? 0),
    selling_price: String(product.selling_price ?? 0),
    sale_price: product.sale_price === undefined || product.sale_price === null ? '' : String(product.sale_price),
    discount_percentage: String(product.discount_percentage ?? 0),
    stock_quantity: String(product.stock_quantity ?? 0),
    low_stock_threshold: String(product.low_stock_threshold ?? 5),
    weight: product.weight === undefined || product.weight === null ? '' : String(product.weight),
    seo_title: product.seo_title ?? '',
    seo_description: product.seo_description ?? '',
    status: product.status,
    is_featured: product.is_featured,
    is_new_arrival: product.is_new_arrival,
    is_best_seller: product.is_best_seller,
  }
}

function formToPayload(form: ProductFormState): Partial<Product> {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    sku: form.sku.trim(),
    barcode: form.barcode.trim() || undefined,
    brand_id: form.brand_id || undefined,
    short_description: form.short_description.trim(),
    description: form.description.trim(),
    cost_price: Number(form.cost_price) || 0,
    selling_price: Number(form.selling_price) || 0,
    sale_price: form.sale_price ? Number(form.sale_price) : undefined,
    discount_percentage: Number(form.discount_percentage) || 0,
    stock_quantity: Number(form.stock_quantity) || 0,
    low_stock_threshold: Number(form.low_stock_threshold) || 0,
    weight: form.weight ? Number(form.weight) : undefined,
    seo_title: form.seo_title.trim() || undefined,
    seo_description: form.seo_description.trim() || undefined,
    status: form.status,
    is_featured: form.is_featured,
    is_new_arrival: form.is_new_arrival,
    is_best_seller: form.is_best_seller,
  }
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const importInputRef = useRef<HTMLInputElement>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | ProductStatus>('all')
  const [brandId, setBrandId] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<ProductFormState>(defaultForm)
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status === 'all' ? undefined : status,
      brand_id: brandId || undefined,
    }),
    [brandId, search, status]
  )

  const productsQuery = useQuery({
    queryKey: ['admin-products', filters, page],
    queryFn: () => fetchAdminProducts(filters, { page, limit: ADMIN_ITEMS_PER_PAGE }),
  })

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories-all'],
    queryFn: fetchAllCategories,
  })

  const brandsQuery = useQuery({
    queryKey: ['admin-brands-all'],
    queryFn: fetchAllBrands,
  })

  const products = productsQuery.data?.data ?? []
  const totalPages = productsQuery.data?.totalPages ?? 1

  const metrics = useMemo(() => {
    const visible = products.filter((product) => product.status !== 'archived')
    return {
      active: products.filter((product) => product.status === 'active').length,
      lowStock: products.filter((product) => product.stock_quantity <= product.low_stock_threshold).length,
      archived: products.filter((product) => product.status === 'archived').length,
      inventoryValue: visible.reduce((sum, product) => sum + product.stock_quantity * product.cost_price, 0),
    }
  }, [products])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = formToPayload(form)
      const product = editingProduct
        ? await updateProduct(editingProduct.id, payload)
        : await createProduct(payload)

      await syncProductCategories(product.id, form.category_ids)
      await syncProductTags(product.id, form.tags.split(','))
      if (imageFiles.length > 0) {
        await uploadProductImages(product.id, imageFiles)
      }
      return product
    },
    onSuccess: () => {
      toast.success(editingProduct ? 'Product updated' : 'Product created')
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      closeModal()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const duplicateMutation = useMutation({
    mutationFn: duplicateProduct,
    onSuccess: () => {
      toast.success('Product duplicated as draft')
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ ids, nextStatus }: { ids: string[]; nextStatus: ProductStatus }) =>
      bulkUpdateProducts(ids, { status: nextStatus }),
    onSuccess: () => {
      toast.success('Products updated')
      setSelectedIds([])
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const archiveMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Product archived')
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const importMutation = useMutation({
    mutationFn: importProductsFromCSV,
    onSuccess: (result) => {
      toast.success(`Imported ${result.imported} products`)
      if (result.errors.length > 0) toast.error(`${result.errors.length} rows need attention`)
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const openCreateModal = () => {
    setEditingProduct(null)
    setForm(defaultForm)
    setImageFiles([])
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setForm(productToForm(product))
    setImageFiles([])
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setImageFiles([])
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    )
  }

  const toggleAll = () => {
    setSelectedIds((current) => current.length === products.length ? [] : products.map((product) => product.id))
  }

  const exportProducts = async () => {
    try {
      const csv = await exportProductsToCSV(filters)
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `products-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Product CSV exported')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export failed')
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Create, edit, publish, hide, duplicate, archive, import, export, and monitor stock from one admin workspace."
        actions={
          <>
            <input
              ref={importInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) importMutation.mutate(file)
                event.target.value = ''
              }}
            />
            <Button variant="secondary" leftIcon={<FileUp size={16} />} onClick={() => importInputRef.current?.click()}>
              Import
            </Button>
            <Button variant="secondary" leftIcon={<Download size={16} />} onClick={exportProducts}>
              Export
            </Button>
            <Button leftIcon={<Plus size={16} />} onClick={openCreateModal}>
              Add Product
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard label="Active" value={metrics.active} helper="Published products" tone="success" icon={<Eye size={19} />} />
        <AdminMetricCard label="Low Stock" value={metrics.lowStock} helper="At or below threshold" tone="warning" icon={<Boxes size={19} />} />
        <AdminMetricCard label="Archived" value={metrics.archived} helper="Restorable catalog items" tone="danger" icon={<ArchiveRestore size={19} />} />
        <AdminMetricCard label="Cost Value" value={formatCurrency(metrics.inventoryValue)} helper="Visible inventory cost" tone="primary" icon={<Package size={19} />} />
      </div>

      <AdminToolbar>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            label="Search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            leftIcon={<Search size={16} />}
            clearable
            placeholder="Name, SKU, description"
          />
          <Select
            label="Status"
            value={status}
            onChange={(value) => {
              setStatus((value as ProductStatus | null) ?? 'all')
              setPage(1)
            }}
            options={[
              { label: 'All statuses', value: 'all' },
              ...PRODUCT_STATUSES.map((item) => ({ label: item.label, value: item.value })),
            ]}
            clearable={false}
          />
          <Select
            label="Brand"
            value={brandId || null}
            onChange={(value) => {
              setBrandId((value as string | null) ?? '')
              setPage(1)
            }}
            options={(brandsQuery.data ?? []).map((brand) => ({ label: brand.name, value: brand.id }))}
            placeholder="All brands"
            searchable
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-primary-50 p-2 text-sm text-primary-800 dark:bg-primary-950/30 dark:text-primary-200">
            <span className="px-2 font-semibold">{selectedIds.length} selected</span>
            <Button size="sm" variant="secondary" onClick={() => updateStatusMutation.mutate({ ids: selectedIds, nextStatus: 'active' })}>Activate</Button>
            <Button size="sm" variant="secondary" onClick={() => updateStatusMutation.mutate({ ids: selectedIds, nextStatus: 'hidden' })}>Hide</Button>
            <Button size="sm" variant="danger" onClick={() => updateStatusMutation.mutate({ ids: selectedIds, nextStatus: 'archived' })}>Archive</Button>
          </div>
        )}
      </AdminToolbar>

      {productsQuery.isLoading ? (
        <div className="card p-6 text-sm text-surface-500">Loading products...</div>
      ) : products.length === 0 ? (
        <EmptyAdminState
          icon={<Package size={24} />}
          title="No products found"
          description="Adjust your filters or add the first product to start building the catalog."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="border-b border-surface-200 bg-surface-50 text-left text-xs uppercase tracking-wide text-surface-500 dark:border-surface-800 dark:bg-surface-800/50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === products.length}
                      onChange={toggleAll}
                      className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                      aria-label="Select all products"
                    />
                  </th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {products.map((product) => {
                  const stock = getStockStatus(product.stock_quantity, product.low_stock_threshold)
                  return (
                    <tr key={product.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/40">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelected(product.id)}
                          className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                          aria-label={`Select ${product.name}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-xl bg-surface-100 dark:bg-surface-800">
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-surface-400">
                                <ImagePlus size={18} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-surface-900 dark:text-white">{product.name}</p>
                            <p className="text-xs text-surface-500">SKU {product.sku || 'Unassigned'}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {product.is_featured && <StatusPill tone="primary">Featured</StatusPill>}
                              {product.is_new_arrival && <StatusPill tone="success">New</StatusPill>}
                              {product.is_best_seller && <StatusPill tone="warning">Best seller</StatusPill>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-surface-600 dark:text-surface-300">{product.brand?.name ?? 'No brand'}</td>
                      <td className="px-4 py-4">
                        <p className="font-semibold">{formatCurrency(product.sale_price || product.selling_price)}</p>
                        {product.sale_price && <p className="text-xs text-surface-500 line-through">{formatCurrency(product.selling_price)}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill tone={stock.status === 'in_stock' ? 'success' : stock.status === 'low_stock' ? 'warning' : 'danger'}>
                          {product.stock_quantity} in stock
                        </StatusPill>
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill tone={statusTone[product.status]}>{product.status}</StatusPill>
                      </td>
                      <td className="px-4 py-4 text-surface-500">{formatDate(product.updated_at)}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" iconOnly leftIcon={<Pencil size={16} />} aria-label="Edit product" onClick={() => openEditModal(product)} />
                          <Button size="sm" variant="ghost" iconOnly leftIcon={<Copy size={16} />} aria-label="Duplicate product" onClick={() => duplicateMutation.mutate(product.id)} />
                          {product.status === 'hidden' ? (
                            <Button size="sm" variant="ghost" iconOnly leftIcon={<Eye size={16} />} aria-label="Publish product" onClick={() => updateStatusMutation.mutate({ ids: [product.id], nextStatus: 'active' })} />
                          ) : (
                            <Button size="sm" variant="ghost" iconOnly leftIcon={<EyeOff size={16} />} aria-label="Hide product" onClick={() => updateStatusMutation.mutate({ ids: [product.id], nextStatus: 'hidden' })} />
                          )}
                          {product.status === 'archived' ? (
                            <Button size="sm" variant="ghost" iconOnly leftIcon={<ArchiveRestore size={16} />} aria-label="Restore product" onClick={() => updateStatusMutation.mutate({ ids: [product.id], nextStatus: 'draft' })} />
                          ) : (
                            <Button size="sm" variant="ghost" iconOnly leftIcon={<Trash2 size={16} />} aria-label="Archive product" onClick={() => archiveMutation.mutate(product.id)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-surface-200 px-4 py-3 text-sm text-surface-500 dark:border-surface-800">
            <span>Page {page} of {Math.max(totalPages, 1)}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
              <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      <ProductEditorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        form={form}
        setForm={setForm}
        brands={brandsQuery.data ?? []}
        categories={categoriesQuery.data ?? []}
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
        editingProduct={editingProduct}
        onSubmit={() => saveMutation.mutate()}
        isSaving={saveMutation.isPending}
      />
    </div>
  )
}

function ProductEditorModal({
  isOpen,
  onClose,
  form,
  setForm,
  brands,
  categories,
  imageFiles,
  setImageFiles,
  editingProduct,
  onSubmit,
  isSaving,
}: {
  isOpen: boolean
  onClose: () => void
  form: ProductFormState
  setForm: (updater: ProductFormState | ((current: ProductFormState) => ProductFormState)) => void
  brands: Brand[]
  categories: Category[]
  imageFiles: File[]
  setImageFiles: (files: File[]) => void
  editingProduct: Product | null
  onSubmit: () => void
  isSaving: boolean
}) {
  const update = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingProduct ? 'Edit product' : 'Add product'} size="xl">
      <ModalBody className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" required value={form.name} onChange={(event) => update('name', event.target.value)} />
          <Input label="Slug" value={form.slug} onChange={(event) => update('slug', event.target.value)} placeholder={slugify(form.name) || 'auto-generated'} />
          <Input label="SKU" required value={form.sku} onChange={(event) => update('sku', event.target.value)} />
          <Input label="Barcode" value={form.barcode} onChange={(event) => update('barcode', event.target.value)} />
          <Select
            label="Brand"
            value={form.brand_id || null}
            onChange={(value) => update('brand_id', (value as string | null) ?? '')}
            options={brands.map((brand) => ({ label: brand.name, value: brand.id }))}
            searchable
            placeholder="Select brand"
          />
          <Select
            label="Categories"
            value={form.category_ids}
            onChange={(value) => update('category_ids', Array.isArray(value) ? value : [])}
            options={categories.map((category) => ({ label: category.name, value: category.id }))}
            searchable
            multiple
            placeholder="Select categories"
          />
        </div>

        <Input label="Short description" value={form.short_description} onChange={(event) => update('short_description', event.target.value)} />
        <Input label="Description" asTextarea rows={5} value={form.description} onChange={(event) => update('description', event.target.value)} />

        <div className="grid gap-4 md:grid-cols-4">
          <Input label="Cost" type="number" min="0" step="0.01" value={form.cost_price} onChange={(event) => update('cost_price', event.target.value)} />
          <Input label="Price" type="number" min="0" step="0.01" value={form.selling_price} onChange={(event) => update('selling_price', event.target.value)} />
          <Input label="Sale price" type="number" min="0" step="0.01" value={form.sale_price} onChange={(event) => update('sale_price', event.target.value)} />
          <Input label="Discount %" type="number" min="0" max="100" value={form.discount_percentage} onChange={(event) => update('discount_percentage', event.target.value)} />
          <Input label="Stock" type="number" min="0" value={form.stock_quantity} onChange={(event) => update('stock_quantity', event.target.value)} />
          <Input label="Low stock" type="number" min="0" value={form.low_stock_threshold} onChange={(event) => update('low_stock_threshold', event.target.value)} />
          <Input label="Weight" type="number" min="0" step="0.01" value={form.weight} onChange={(event) => update('weight', event.target.value)} />
          <Select
            label="Status"
            value={form.status}
            onChange={(value) => update('status', (value as ProductStatus | null) ?? 'draft')}
            options={PRODUCT_STATUSES.map((item) => ({ label: item.label, value: item.value }))}
            clearable={false}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Tags" value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="premium, home, gift" />
          <Input label="SEO title" value={form.seo_title} onChange={(event) => update('seo_title', event.target.value)} />
        </div>
        <Input label="SEO description" asTextarea rows={3} value={form.seo_description} onChange={(event) => update('seo_description', event.target.value)} />

        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['is_featured', 'Featured product'],
            ['is_new_arrival', 'New arrival'],
            ['is_best_seller', 'Best seller'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-xl border border-surface-200 p-3 text-sm dark:border-surface-700">
              <input
                type="checkbox"
                checked={Boolean(form[key as keyof ProductFormState])}
                onChange={(event) => update(key as keyof ProductFormState, event.target.checked as never)}
                className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="font-medium">{label}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-800 dark:text-surface-200">
            Product images
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-surface-300 bg-surface-50 px-4 py-6 text-center transition hover:border-primary-400 hover:bg-primary-50 dark:border-surface-700 dark:bg-surface-800/50 dark:hover:bg-primary-950/20">
            <ImagePlus className="mb-2 text-surface-400" size={24} />
            <span className="text-sm font-medium">Upload multiple images</span>
            <span className="mt-1 text-xs text-surface-500">{imageFiles.length ? `${imageFiles.length} files selected` : 'The first uploaded image becomes featured'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => setImageFiles(Array.from(event.target.files ?? []))}
            />
          </label>
        </div>
      </ModalBody>
      <ModalFooter className="justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} loading={isSaving} disabled={!form.name || !form.sku}>Save product</Button>
      </ModalFooter>
    </Modal>
  )
}
