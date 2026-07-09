import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { BadgeCheck, ImagePlus, Pencil, Plus, Search, Tags, Trash2 } from 'lucide-react'
import { Button, Input, Modal, ModalBody, ModalFooter } from '@/components/ui'
import { createBrand, deleteBrand, fetchAllBrands, updateBrand } from '@/lib/api/brands'
import { slugify } from '@/lib/utils'
import type { Brand } from '@/types'
import { AdminMetricCard, AdminPageHeader, AdminToolbar, EmptyAdminState, StatusPill } from './AdminPrimitives'

type BrandFormState = {
  name: string
  slug: string
  logo_url: string
  description: string
  is_active: boolean
}

const defaultForm: BrandFormState = {
  name: '',
  slug: '',
  logo_url: '',
  description: '',
  is_active: true,
}

function brandToForm(brand: Brand): BrandFormState {
  return {
    name: brand.name,
    slug: brand.slug,
    logo_url: brand.logo_url ?? '',
    description: brand.description ?? '',
    is_active: brand.is_active,
  }
}

function formToPayload(form: BrandFormState): Partial<Brand> {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    logo_url: form.logo_url.trim() || undefined,
    description: form.description.trim() || undefined,
    is_active: form.is_active,
  }
}

export default function BrandsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<BrandFormState>(defaultForm)

  const brandsQuery = useQuery({
    queryKey: ['admin-brands-all'],
    queryFn: fetchAllBrands,
  })

  const brands = brandsQuery.data ?? []
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return brands
    return brands.filter((brand) =>
      [brand.name, brand.slug, brand.description ?? ''].some((value) => value.toLowerCase().includes(needle))
    )
  }, [brands, search])

  const active = brands.filter((brand) => brand.is_active)
  const withLogos = brands.filter((brand) => brand.logo_url)

  const saveMutation = useMutation({
    mutationFn: () =>
      editingBrand
        ? updateBrand(editingBrand.id, formToPayload(form))
        : createBrand(formToPayload(form)),
    onSuccess: () => {
      toast.success(editingBrand ? 'Brand updated' : 'Brand created')
      queryClient.invalidateQueries({ queryKey: ['admin-brands-all'] })
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      closeModal()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      toast.success('Brand deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-brands-all'] })
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const openCreateModal = () => {
    setEditingBrand(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand)
    setForm(brandToForm(brand))
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBrand(null)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Brands"
        description="Control brand pages, storefront visibility, logos, descriptions, and product attribution metadata."
        actions={<Button leftIcon={<Plus size={16} />} onClick={openCreateModal}>Add Brand</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard label="Brands" value={brands.length} helper="Total records" tone="primary" icon={<Tags size={19} />} />
        <AdminMetricCard label="Active" value={active.length} helper="Visible to shoppers" tone="success" icon={<BadgeCheck size={19} />} />
        <AdminMetricCard label="With Logos" value={withLogos.length} helper="Ready for brand rails" tone="warning" icon={<ImagePlus size={19} />} />
      </div>

      <AdminToolbar>
        <Input
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          leftIcon={<Search size={16} />}
          clearable
          placeholder="Brand name, slug, description"
        />
      </AdminToolbar>

      {brandsQuery.isLoading ? (
        <div className="card p-6 text-sm text-surface-500">Loading brands...</div>
      ) : filtered.length === 0 ? (
        <EmptyAdminState
          icon={<Tags size={24} />}
          title="No brands found"
          description="Create brands so products can be filtered, merchandised, and grouped cleanly."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((brand) => (
            <div key={brand.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-100 dark:bg-surface-800">
                    {brand.logo_url ? (
                      <img src={brand.logo_url} alt="" className="h-full w-full object-contain p-2" />
                    ) : (
                      <ImagePlus size={18} className="text-surface-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-surface-950 dark:text-white">{brand.name}</h3>
                      <StatusPill tone={brand.is_active ? 'success' : 'warning'}>
                        {brand.is_active ? 'Active' : 'Inactive'}
                      </StatusPill>
                    </div>
                    <p className="text-xs text-surface-500">/{brand.slug}</p>
                    {brand.description && <p className="mt-2 line-clamp-2 text-sm text-surface-500">{brand.description}</p>}
                  </div>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <Button size="sm" variant="ghost" iconOnly leftIcon={<Pencil size={16} />} aria-label="Edit brand" onClick={() => openEditModal(brand)} />
                  <Button size="sm" variant="ghost" iconOnly leftIcon={<Trash2 size={16} />} aria-label="Delete brand" onClick={() => deleteMutation.mutate(brand.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BrandEditorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        form={form}
        setForm={setForm}
        editingBrand={editingBrand}
        onSubmit={() => saveMutation.mutate()}
        isSaving={saveMutation.isPending}
      />
    </div>
  )
}

function BrandEditorModal({
  isOpen,
  onClose,
  form,
  setForm,
  editingBrand,
  onSubmit,
  isSaving,
}: {
  isOpen: boolean
  onClose: () => void
  form: BrandFormState
  setForm: (updater: BrandFormState | ((current: BrandFormState) => BrandFormState)) => void
  editingBrand: Brand | null
  onSubmit: () => void
  isSaving: boolean
}) {
  const update = <K extends keyof BrandFormState>(key: K, value: BrandFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingBrand ? 'Edit brand' : 'Add brand'} size="lg">
      <ModalBody className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" required value={form.name} onChange={(event) => update('name', event.target.value)} />
          <Input label="Slug" value={form.slug} onChange={(event) => update('slug', event.target.value)} placeholder={slugify(form.name) || 'auto-generated'} />
        </div>
        <Input label="Logo URL" value={form.logo_url} onChange={(event) => update('logo_url', event.target.value)} />
        <Input label="Description" asTextarea rows={4} value={form.description} onChange={(event) => update('description', event.target.value)} />
        <label className="flex items-center gap-3 rounded-xl border border-surface-200 p-3 text-sm dark:border-surface-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => update('is_active', event.target.checked)}
            className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="font-medium">Visible on storefront</span>
        </label>
      </ModalBody>
      <ModalFooter className="justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} loading={isSaving} disabled={!form.name}>Save brand</Button>
      </ModalFooter>
    </Modal>
  )
}
