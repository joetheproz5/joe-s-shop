import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FolderTree, ImagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Button, Input, Modal, ModalBody, ModalFooter, Select } from '@/components/ui'
import {
  buildCategoryTree,
  createCategory,
  deleteCategory,
  fetchAllCategories,
  updateCategory,
} from '@/lib/api/categories'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types'
import { AdminMetricCard, AdminPageHeader, AdminToolbar, EmptyAdminState, StatusPill } from './AdminPrimitives'

type CategoryFormState = {
  name: string
  slug: string
  description: string
  image_url: string
  parent_id: string
  sort_order: string
  is_active: boolean
}

const defaultForm: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  parent_id: '',
  sort_order: '0',
  is_active: true,
}

function categoryToForm(category: Category): CategoryFormState {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    image_url: category.image_url ?? '',
    parent_id: category.parent_id ?? '',
    sort_order: String(category.sort_order ?? 0),
    is_active: category.is_active,
  }
}

function formToPayload(form: CategoryFormState): Partial<Category> {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    description: form.description.trim() || undefined,
    image_url: form.image_url.trim() || undefined,
    parent_id: form.parent_id || null,
    sort_order: Number(form.sort_order) || 0,
    is_active: form.is_active,
  }
}

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<CategoryFormState>(defaultForm)

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories-all'],
    queryFn: fetchAllCategories,
  })

  const categories = categoriesQuery.data ?? []
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return categories
    return categories.filter((category) =>
      [category.name, category.slug, category.description ?? ''].some((value) =>
        value.toLowerCase().includes(needle)
      )
    )
  }, [categories, search])

  const roots = categories.filter((category) => !category.parent_id)
  const inactive = categories.filter((category) => !category.is_active)
  const tree = buildCategoryTree(filtered)

  const saveMutation = useMutation({
    mutationFn: () =>
      editingCategory
        ? updateCategory(editingCategory.id, formToPayload(form))
        : createCategory(formToPayload(form)),
    onSuccess: () => {
      toast.success(editingCategory ? 'Category updated' : 'Category created')
      queryClient.invalidateQueries({ queryKey: ['admin-categories-all'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      closeModal()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Category deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-categories-all'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const openCreateModal = () => {
    setEditingCategory(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setForm(categoryToForm(category))
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Manage parent categories, subcategories, imagery, ordering, and storefront visibility."
        actions={<Button leftIcon={<Plus size={16} />} onClick={openCreateModal}>Add Category</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard label="Total" value={categories.length} helper="All category records" tone="primary" icon={<FolderTree size={19} />} />
        <AdminMetricCard label="Top Level" value={roots.length} helper="Root navigation groups" tone="success" icon={<FolderTree size={19} />} />
        <AdminMetricCard label="Inactive" value={inactive.length} helper="Hidden from storefront" tone="warning" icon={<FolderTree size={19} />} />
      </div>

      <AdminToolbar>
        <Input
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          leftIcon={<Search size={16} />}
          clearable
          placeholder="Category name, slug, description"
        />
      </AdminToolbar>

      {categoriesQuery.isLoading ? (
        <div className="card p-6 text-sm text-surface-500">Loading categories...</div>
      ) : filtered.length === 0 ? (
        <EmptyAdminState
          icon={<FolderTree size={24} />}
          title="No categories found"
          description="Create categories and nested collections so customers can browse the catalog naturally."
        />
      ) : (
        <div className="grid gap-4">
          {tree.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              allCategories={categories}
              level={0}
              onEdit={openEditModal}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      <CategoryEditorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        form={form}
        setForm={setForm}
        categories={categories}
        editingCategory={editingCategory}
        onSubmit={() => saveMutation.mutate()}
        isSaving={saveMutation.isPending}
      />
    </div>
  )
}

function CategoryRow({
  category,
  allCategories,
  level,
  onEdit,
  onDelete,
}: {
  category: Category
  allCategories: Category[]
  level: number
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}) {
  const children = category.children ?? []
  const parent = category.parent_id ? allCategories.find((item) => item.id === category.parent_id) : null

  return (
    <div className="space-y-3">
      <div className="card p-4" style={{ marginLeft: level ? Math.min(level * 20, 48) : 0 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-100 dark:bg-surface-800">
              {category.image_url ? (
                <img src={category.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus size={18} className="text-surface-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-semibold text-surface-950 dark:text-white">{category.name}</h3>
                <StatusPill tone={category.is_active ? 'success' : 'warning'}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </StatusPill>
              </div>
              <p className="text-xs text-surface-500">/{category.slug} {parent ? `- under ${parent.name}` : ''}</p>
              {category.description && <p className="mt-1 line-clamp-1 text-sm text-surface-500">{category.description}</p>}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <span className="text-xs text-surface-500">Order {category.sort_order}</span>
            <Button size="sm" variant="ghost" iconOnly leftIcon={<Pencil size={16} />} aria-label="Edit category" onClick={() => onEdit(category)} />
            <Button size="sm" variant="ghost" iconOnly leftIcon={<Trash2 size={16} />} aria-label="Delete category" onClick={() => onDelete(category.id)} />
          </div>
        </div>
      </div>
      {children.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          allCategories={allCategories}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

function CategoryEditorModal({
  isOpen,
  onClose,
  form,
  setForm,
  categories,
  editingCategory,
  onSubmit,
  isSaving,
}: {
  isOpen: boolean
  onClose: () => void
  form: CategoryFormState
  setForm: (updater: CategoryFormState | ((current: CategoryFormState) => CategoryFormState)) => void
  categories: Category[]
  editingCategory: Category | null
  onSubmit: () => void
  isSaving: boolean
}) {
  const update = <K extends keyof CategoryFormState>(key: K, value: CategoryFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const parentOptions = categories
    .filter((category) => category.id !== editingCategory?.id)
    .map((category) => ({ label: category.name, value: category.id }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingCategory ? 'Edit category' : 'Add category'} size="lg">
      <ModalBody className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" required value={form.name} onChange={(event) => update('name', event.target.value)} />
          <Input label="Slug" value={form.slug} onChange={(event) => update('slug', event.target.value)} placeholder={slugify(form.name) || 'auto-generated'} />
        </div>
        <Input label="Description" asTextarea rows={4} value={form.description} onChange={(event) => update('description', event.target.value)} />
        <Input label="Image URL" value={form.image_url} onChange={(event) => update('image_url', event.target.value)} />
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Parent category"
            value={form.parent_id || null}
            onChange={(value) => update('parent_id', (value as string | null) ?? '')}
            options={parentOptions}
            placeholder="No parent"
            searchable
          />
          <Input label="Sort order" type="number" value={form.sort_order} onChange={(event) => update('sort_order', event.target.value)} />
        </div>
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
        <Button onClick={onSubmit} loading={isSaving} disabled={!form.name}>Save category</Button>
      </ModalFooter>
    </Modal>
  )
}
