import { useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  BarChart3,
  Check,
  CreditCard,
  Eye,
  FileText,
  FolderOpen,
  Gift,
  History,
  ImagePlus,
  Mail,
  MapPin,
  Package,
  Pencil,
  Plus,
  Printer,
  Search,
  Settings,
  Shield,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { Button, Input, Modal, ModalBody, ModalFooter, Select } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { fetchAdminOrders, updateOrderStatus, updatePaymentStatus } from '@/lib/api/orders'
import { notifyOrderCustomer } from '@/lib/api/orderEmails'
import { createCoupon, deleteCoupon, fetchCoupons, updateCoupon } from '@/lib/api/coupons'
import { deleteReview, fetchAdminReviews, updateReviewStatus } from '@/lib/api/reviews'
import {
  fetchDashboardStats,
  fetchInventoryStats,
  fetchSalesData,
  fetchTopCustomers,
  fetchTopProducts,
} from '@/lib/api/analytics'
import { deleteMedia, listMedia, uploadMedia } from '@/lib/api/media'
import { fetchSettings, updateSettings } from '@/lib/api/settings'
import { ORDER_STATUSES, COUPON_TYPES, REVIEW_STATUSES, ROLES } from '@/lib/constants'
import { formatCurrency, formatDate, formatFileSize, getStockStatus } from '@/lib/utils'
import { ADMIN_MODULES, hasAdminPermission, isStaffRole } from '@/lib/permissions'
import type {
  Coupon,
  CouponType,
  InventoryAction,
  Media,
  MediaType,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Profile,
  Review,
  ReviewStatus,
  Settings as SettingsRecord,
  UserRole,
} from '@/types'
import { AdminMetricCard, AdminPageHeader, AdminToolbar, EmptyAdminState, StatusPill } from './AdminPrimitives'

const statusTone: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'surface'> = {
  pending: 'warning',
  paid: 'primary',
  processing: 'primary',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'danger',
  approved: 'success',
  rejected: 'danger',
  active: 'success',
  banned: 'danger',
  customer: 'surface',
  employee: 'primary',
  manager: 'primary',
  admin: 'warning',
  super_admin: 'danger',
}

type InvoiceAddress = {
  first_name?: string
  last_name?: string
  street_address_1?: string
  street_address_2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  phone?: string
  email?: string
}

function getInvoiceCustomer(order: Order) {
  const address = (order.shipping_address || {}) as InvoiceAddress
  const profileName = order.user
    ? `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim()
    : ''
  const addressName = `${address.first_name || ''} ${address.last_name || ''}`.trim()

  return {
    address,
    name: profileName || addressName || 'Guest customer',
    email: order.guest_email || address.email || '',
    phone: order.user?.phone || address.phone || '',
  }
}

function InvoiceAddressBlock({ address }: { address: InvoiceAddress }) {
  const region = [address.state, address.postal_code].filter(Boolean).join(' ')
  const cityLine = [address.city, region].filter(Boolean).join(', ')
  return (
    <div className="invoice-address-lines text-sm leading-6 text-surface-600 dark:text-surface-300">
      {address.street_address_1 && <div>{address.street_address_1}</div>}
      {address.street_address_2 && <div>{address.street_address_2}</div>}
      {cityLine && <div>{cityLine}</div>}
      {address.country && <div>{address.country}</div>}
    </div>
  )
}

function OrderInvoice({ order, invoiceRef }: { order: Order; invoiceRef: React.RefObject<HTMLDivElement> }) {
  const customer = getInvoiceCustomer(order)
  const itemCount = (order.items || []).reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div ref={invoiceRef} className="invoice-document bg-white p-1 text-surface-950 dark:bg-surface-900 dark:text-white">
      <div className="invoice-header flex flex-col gap-5 border-b border-surface-200 pb-6 sm:flex-row sm:items-start sm:justify-between dark:border-surface-700">
        <div>
          <div className="invoice-brand text-xl font-bold">Joe's Shop</div>
          <div className="invoice-subtitle mt-1 text-sm text-surface-500">Order invoice</div>
        </div>
        <div className="invoice-heading sm:text-right">
          <div className="text-2xl font-bold">{order.order_number}</div>
          <div className="mt-1 text-sm text-surface-500">Issued {formatDate(order.created_at, 'long')}</div>
        </div>
      </div>

      <div className="invoice-meta-grid grid gap-5 border-b border-surface-200 py-6 sm:grid-cols-3 dark:border-surface-700">
        <section className="invoice-section">
          <div className="invoice-label mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-surface-500"><Mail size={14} /> Customer</div>
          <div className="font-semibold">{customer.name}</div>
          {customer.email && <div className="mt-1 break-all text-sm text-surface-600 dark:text-surface-300">{customer.email}</div>}
          {customer.phone && <div className="mt-1 text-sm text-surface-600 dark:text-surface-300">{customer.phone}</div>}
          {!customer.email && !customer.phone && <div className="mt-1 text-sm text-surface-500">Account customer</div>}
        </section>
        <section className="invoice-section">
          <div className="invoice-label mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-surface-500"><MapPin size={14} /> Ship to</div>
          <InvoiceAddressBlock address={customer.address} />
        </section>
        <section className="invoice-section">
          <div className="invoice-label mb-2 text-xs font-semibold uppercase text-surface-500">Order details</div>
          <dl className="invoice-detail-list space-y-1 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-surface-500">Status</dt><dd className="capitalize font-medium">{order.status}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-surface-500">Payment</dt><dd className="capitalize font-medium">{order.payment_method?.replace(/_/g, ' ') || 'Not set'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-surface-500">Payment status</dt><dd className="capitalize font-medium">{order.payment_status}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-surface-500">Shipping</dt><dd className="font-medium">{order.shipping_method || 'Standard'}</dd></div>
          </dl>
        </section>
      </div>

      <div className="invoice-items py-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Order contents</h3>
          <span className="text-sm text-surface-500">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="invoice-table w-full text-left text-sm">
            <thead>
              <tr className="border-y border-surface-200 text-xs uppercase text-surface-500 dark:border-surface-700">
                <th className="py-3 pr-3">Item</th><th className="px-3 py-3">SKU</th><th className="px-3 py-3 text-center">Qty</th><th className="px-3 py-3 text-right">Unit price</th><th className="py-3 pl-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-surface-500">No line items were recorded for this order.</td></tr>
              )}
              {(order.items || []).map((item) => (
                <tr key={item.id} className="border-b border-surface-100 dark:border-surface-800">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-200 bg-white p-1 dark:border-surface-700">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <Package size={18} className="text-surface-400" />
                        )}
                      </div>
                      <span className="font-medium">{item.product_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-surface-500">{item.sku || '-'}</td>
                  <td className="px-3 py-3 text-center">{item.quantity}</td>
                  <td className="px-3 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="py-3 pl-3 text-right font-semibold">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="invoice-summary ml-auto w-full max-w-sm border-t border-surface-200 pt-4 dark:border-surface-700">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-surface-500">Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-surface-500">Tax</dt><dd>{formatCurrency(order.tax)}</dd></div>
          <div className="flex justify-between"><dt className="text-surface-500">Shipping</dt><dd>{order.shipping_cost === 0 ? 'Free' : formatCurrency(order.shipping_cost)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between"><dt className="text-surface-500">Discount</dt><dd>-{formatCurrency(order.discount)}</dd></div>}
          <div className="invoice-total flex justify-between border-t border-surface-200 pt-3 text-lg font-bold dark:border-surface-700"><dt>Total</dt><dd>{formatCurrency(order.total)}</dd></div>
        </dl>
      </div>

      {order.customer_note && (
        <div className="invoice-note mt-6 border-t border-surface-200 pt-4 text-sm dark:border-surface-700">
          <div className="invoice-label mb-1 text-xs font-semibold uppercase text-surface-500">Customer note</div>
          <p>{order.customer_note}</p>
        </div>
      )}
    </div>
  )
}

export function OrdersPage() {
  const queryClient = useQueryClient()
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | OrderStatus>('all')
  const [page, setPage] = useState(1)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [detailStatus, setDetailStatus] = useState<OrderStatus>('pending')
  const [detailPaymentStatus, setDetailPaymentStatus] = useState<PaymentStatus>('pending')
  const [detailInternalNote, setDetailInternalNote] = useState('')
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [nextStatus, setNextStatus] = useState<OrderStatus>('processing')
  const [nextPaymentStatus, setNextPaymentStatus] = useState<PaymentStatus>('pending')
  const [internalNote, setInternalNote] = useState('')

  const filters = useMemo(() => ({
    search: search.trim() || undefined,
    status: status === 'all' ? undefined : status,
  }), [search, status])

  const ordersQuery = useQuery({
    queryKey: ['admin-orders-page', filters, page],
    queryFn: () => fetchAdminOrders(filters, { page, limit: 20 }),
  })

  const orders = ordersQuery.data?.data ?? []
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const openOrders = orders.filter((order) => !['delivered', 'cancelled', 'refunded'].includes(order.status)).length

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingOrder) return
      const customerChanged = nextStatus !== editingOrder.status || nextPaymentStatus !== editingOrder.payment_status
      await updateOrderStatus(editingOrder.id, nextStatus, internalNote.trim())
      await updatePaymentStatus(editingOrder.id, nextPaymentStatus)
      return customerChanged ? notifyOrderCustomer(editingOrder.id, 'status_updated') : { sent: true }
    },
    onSuccess: (emailResult) => {
      toast.success('Order updated')
      if (emailResult && !emailResult.sent) toast.error('Order updated, but the customer email could not be sent.')
      setEditingOrder(null)
      queryClient.invalidateQueries({ queryKey: ['admin-orders-page'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const detailUpdateMutation = useMutation({
    mutationFn: async () => {
      if (!viewingOrder) return
      const customerChanged = detailStatus !== viewingOrder.status || detailPaymentStatus !== viewingOrder.payment_status
      await updateOrderStatus(viewingOrder.id, detailStatus, detailInternalNote.trim())
      await updatePaymentStatus(viewingOrder.id, detailPaymentStatus)
      return customerChanged ? notifyOrderCustomer(viewingOrder.id, 'status_updated') : { sent: true }
    },
    onSuccess: (emailResult) => {
      setViewingOrder((order) => order ? {
        ...order,
        status: detailStatus,
        payment_status: detailPaymentStatus,
        internal_note: detailInternalNote.trim() || undefined,
      } : order)
      toast.success('Order status updated')
      if (emailResult && !emailResult.sent) toast.error('Status saved, but the customer email could not be sent.')
      queryClient.invalidateQueries({ queryKey: ['admin-orders-page'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-recent-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-order-status'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const viewOrder = (order: Order) => {
    setViewingOrder(order)
    setDetailStatus(order.status)
    setDetailPaymentStatus(order.payment_status)
    setDetailInternalNote(order.internal_note ?? '')
  }

  const changeDetailStatus = (value: string | string[] | null) => {
    const next = (value as OrderStatus | null) ?? 'pending'
    setDetailStatus(next)
    if (next === 'paid') setDetailPaymentStatus('paid')
    if (next === 'refunded') setDetailPaymentStatus('refunded')
  }

  const openOrder = (order: Order) => {
    setEditingOrder(order)
    setNextStatus(order.status)
    setNextPaymentStatus(order.payment_status)
    setInternalNote(order.internal_note ?? '')
  }

  const printInvoice = () => {
    if (!viewingOrder || !invoiceRef.current) return
    const printWindow = window.open('', '_blank', 'width=900,height=720')
    if (!printWindow) {
      toast.error('Allow pop-ups to print this invoice.')
      return
    }

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Invoice</title>
          <style>
            * { box-sizing: border-box; }
            @page { size: A4; margin: 14mm; }
            body { margin: 0; color: #202124; background: #fff; font-family: Arial, Helvetica, sans-serif; font-size: 13px; }
            .invoice-document { width: 100%; max-width: 800px; margin: 0 auto; }
            .invoice-header { display: flex; justify-content: space-between; gap: 32px; padding-bottom: 22px; border-bottom: 1px solid #dadce0; }
            .invoice-heading { text-align: right; }
            .invoice-brand { font-size: 22px; font-weight: 700; }
            .invoice-subtitle, .text-surface-500 { color: #5f6368; }
            .text-surface-600, .dark\\:text-surface-300 { color: #3c4043; }
            .invoice-heading .text-2xl { margin-top: 0; font-size: 23px; font-weight: 700; }
            .invoice-meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; padding: 22px 0; border-bottom: 1px solid #dadce0; }
            .invoice-label { color: #5f6368; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
            .invoice-label svg { display: none; }
            .invoice-address-lines { line-height: 1.6; }
            .invoice-detail-list { margin: 0; }
            .invoice-detail-list > div, .invoice-summary dl > div { display: flex; justify-content: space-between; gap: 18px; margin: 7px 0; }
            dt, dd { margin: 0; }
            .invoice-items { padding: 22px 0; }
            .invoice-items > div:first-child { display: flex; justify-content: space-between; align-items: center; }
            .invoice-items h3 { margin: 0 0 10px; font-size: 15px; }
            .invoice-table { width: 100%; border-collapse: collapse; }
            .invoice-table th { padding: 10px 8px; border-top: 1px solid #dadce0; border-bottom: 1px solid #dadce0; color: #5f6368; font-size: 10px; text-transform: uppercase; }
            .invoice-table td { padding: 11px 8px; border-bottom: 1px solid #f1f3f4; }
            .invoice-table img { width: 42px; height: 42px; object-fit: contain; }
            .invoice-table th:first-child, .invoice-table td:first-child { padding-left: 0; }
            .invoice-table th:last-child, .invoice-table td:last-child { padding-right: 0; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-medium, .font-semibold { font-weight: 600; }
            .invoice-summary { width: 330px; margin-left: auto; padding-top: 14px; border-top: 1px solid #dadce0; }
            .invoice-total { margin-top: 10px !important; padding-top: 12px; border-top: 1px solid #dadce0; font-size: 17px; font-weight: 700; }
            .invoice-note { margin-top: 24px; padding-top: 14px; border-top: 1px solid #dadce0; }
            .invoice-note p { margin: 5px 0 0; }
            svg { width: 14px; height: 14px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>${invoiceRef.current.outerHTML}</body>
      </html>`)
    printWindow.document.close()
    printWindow.focus()
    window.setTimeout(() => printWindow.print(), 250)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Orders"
        description="Search orders, update fulfillment and payment status, add internal notes, and print operational paperwork."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard label="Visible Revenue" value={formatCurrency(revenue)} helper="Current filtered page" tone="success" icon={<CreditCard size={19} />} />
        <AdminMetricCard label="Orders" value={orders.length} helper="Current page" tone="primary" icon={<FileText size={19} />} />
        <AdminMetricCard label="Open" value={openOrders} helper="Needs action" tone="warning" icon={<AlertTriangle size={19} />} />
        <AdminMetricCard label="Total Results" value={ordersQuery.data?.total ?? 0} helper="Matching filters" tone="surface" icon={<Package size={19} />} />
      </div>
      <AdminToolbar>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} leftIcon={<Search size={16} />} clearable placeholder="Order number" />
          <Select
            label="Status"
            value={status}
            onChange={(value) => { setStatus((value as OrderStatus | null) ?? 'all'); setPage(1) }}
            options={[{ label: 'All statuses', value: 'all' }, ...ORDER_STATUSES.map((item) => ({ label: item.label, value: item.value }))]}
            clearable={false}
          />
        </div>
      </AdminToolbar>
      <AdminTable
        isLoading={ordersQuery.isLoading}
        emptyIcon={<FileText size={24} />}
        emptyTitle="No orders found"
        emptyDescription="Orders matching your filters will appear here."
      >
        <thead className="admin-thead">
          <tr><th>Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th>Date</th><th className="text-right">Actions</th></tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              tabIndex={0}
              role="button"
              onClick={() => viewOrder(order)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  viewOrder(order)
                }
              }}
              className="cursor-pointer transition-colors hover:bg-surface-50 focus-visible:bg-primary-50 focus-visible:outline-none dark:hover:bg-surface-800/60 dark:focus-visible:bg-primary-950/20"
            >
              <td><span className="font-semibold text-primary-600">{order.order_number}</span><div className="text-xs text-surface-500">{order.items?.length ?? 0} items</div></td>
              <td>{order.user ? `${order.user.first_name} ${order.user.last_name}`.trim() || 'Customer' : order.guest_email || 'Guest'}</td>
              <td><StatusPill tone={statusTone[order.status]}>{order.status}</StatusPill></td>
              <td>
                <StatusPill tone={statusTone[order.payment_status] ?? 'surface'}>{order.payment_status}</StatusPill>
                <div className="mt-1 text-xs capitalize text-surface-500">{order.payment_method?.replace(/_/g, ' ') || 'Not set'}</div>
              </td>
              <td className="font-semibold">{formatCurrency(order.total)}</td>
              <td>{formatDate(order.created_at)}</td>
              <td>
                <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                  <Button size="sm" variant="ghost" iconOnly leftIcon={<Eye size={16} />} aria-label="View order" title="View order" onClick={() => viewOrder(order)} />
                  <Button size="sm" variant="ghost" iconOnly leftIcon={<Pencil size={16} />} aria-label="Edit order" title="Edit order" onClick={() => openOrder(order)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      <AdminPager page={page} totalPages={ordersQuery.data?.totalPages ?? 1} onPage={setPage} />
      <Modal isOpen={!!viewingOrder} onClose={() => setViewingOrder(null)} title={viewingOrder ? `Order ${viewingOrder.order_number}` : 'Order details'} size="xl">
        {viewingOrder && (
          <>
            <ModalBody className="p-6 sm:p-8">
              <OrderInvoice order={viewingOrder} invoiceRef={invoiceRef} />
              <section className="mt-8 border-t border-surface-200 pt-6 dark:border-surface-700">
                <div className="mb-4">
                  <h3 className="font-semibold">Update order</h3>
                  <p className="mt-1 text-sm text-surface-500">Change fulfillment and payment status without leaving this order.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Select
                    label="Order status"
                    value={detailStatus}
                    onChange={changeDetailStatus}
                    options={ORDER_STATUSES.map((item) => ({ label: item.label, value: item.value }))}
                    clearable={false}
                  />
                  <Select
                    label="Payment status"
                    value={detailPaymentStatus}
                    onChange={(value) => setDetailPaymentStatus((value as PaymentStatus | null) ?? 'pending')}
                    options={['pending', 'paid', 'failed', 'refunded'].map((item) => ({ label: item.charAt(0).toUpperCase() + item.slice(1), value: item }))}
                    clearable={false}
                  />
                </div>
                <Input className="mt-4" label="Internal note" asTextarea rows={3} value={detailInternalNote} onChange={(event) => setDetailInternalNote(event.target.value)} />
              </section>
            </ModalBody>
            <ModalFooter className="justify-between">
              <Button variant="secondary" onClick={() => setViewingOrder(null)}>Close</Button>
              <div className="flex gap-2">
                <Button variant="secondary" leftIcon={<Printer size={16} />} onClick={printInvoice}>Print invoice</Button>
                <Button
                  loading={detailUpdateMutation.isPending}
                  disabled={detailStatus === viewingOrder.status && detailPaymentStatus === viewingOrder.payment_status && detailInternalNote === (viewingOrder.internal_note ?? '')}
                  onClick={() => detailUpdateMutation.mutate()}
                >
                  Save status
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </Modal>
      <Modal isOpen={!!editingOrder} onClose={() => setEditingOrder(null)} title="Update order" size="lg">
        <ModalBody className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Order status" value={nextStatus} onChange={(value) => setNextStatus((value as OrderStatus | null) ?? 'processing')} options={ORDER_STATUSES.map((item) => ({ label: item.label, value: item.value }))} clearable={false} />
            <Select label="Payment status" value={nextPaymentStatus} onChange={(value) => setNextPaymentStatus((value as PaymentStatus | null) ?? 'pending')} options={['pending', 'paid', 'failed', 'refunded'].map((item) => ({ label: item, value: item }))} clearable={false} />
          </div>
          <Input label="Internal note" asTextarea rows={4} value={internalNote} onChange={(event) => setInternalNote(event.target.value)} />
        </ModalBody>
        <ModalFooter className="justify-end">
          <Button variant="secondary" onClick={() => setEditingOrder(null)}>Cancel</Button>
          <Button loading={updateMutation.isPending} onClick={() => updateMutation.mutate()}>Save changes</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export function CustomersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editingCustomer, setEditingCustomer] = useState<Profile | null>(null)
  const [role, setRole] = useState<UserRole>('customer')
  const [banned, setBanned] = useState(false)

  const customersQuery = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .or(search.trim() ? `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%` : 'first_name.ilike.%%')
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id,total,status')
        .not('status', 'in', '("cancelled","refunded")')
      if (ordersError) throw new Error(ordersError.message)

      const stats = new Map<string, { orders: number; spent: number }>()
      for (const order of orders ?? []) {
        const current = stats.get(order.user_id) ?? { orders: 0, spent: 0 }
        current.orders += 1
        current.spent += Number(order.total || 0)
        stats.set(order.user_id, current)
      }

      return (profiles ?? []).map((profile) => ({
        ...(profile as Profile),
        order_count: stats.get(profile.id)?.orders ?? 0,
        lifetime_value: stats.get(profile.id)?.spent ?? 0,
      }))
    },
  })

  const customers = customersQuery.data ?? []
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingCustomer) return
      const { error } = await supabase.from('profiles').update({ role, banned }).eq('id', editingCustomer.id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      toast.success('Customer updated')
      setEditingCustomer(null)
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      toast.success('Customer deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const openCustomer = (customer: Profile) => {
    setEditingCustomer(customer)
    setRole(customer.role)
    setBanned(customer.banned)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="People" title="Customers" description="View customers, manage staff roles, ban accounts, and track customer lifetime value." />
      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard label="Customers" value={customers.length} helper="Matching search" tone="primary" icon={<Users size={19} />} />
        <AdminMetricCard label="Banned" value={customers.filter((c) => c.banned).length} helper="Restricted accounts" tone="danger" icon={<X size={19} />} />
        <AdminMetricCard label="LTV" value={formatCurrency(customers.reduce((sum, c) => sum + c.lifetime_value, 0))} helper="Filtered lifetime spend" tone="success" icon={<CreditCard size={19} />} />
      </div>
      <AdminToolbar>
        <Input label="Search" value={search} onChange={(event) => setSearch(event.target.value)} leftIcon={<Search size={16} />} clearable placeholder="Name or phone" />
      </AdminToolbar>
      <AdminTable isLoading={customersQuery.isLoading} emptyIcon={<Users size={24} />} emptyTitle="No customers found" emptyDescription="Customer accounts will appear here.">
        <thead className="admin-thead"><tr><th>Name</th><th>Phone</th><th>Role</th><th>Orders</th><th>LTV</th><th>Joined</th><th className="text-right">Actions</th></tr></thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td><div className="font-semibold">{`${customer.first_name} ${customer.last_name}`.trim() || 'Unnamed customer'}</div>{customer.banned && <StatusPill tone="danger">Banned</StatusPill>}</td>
              <td>{customer.phone || 'N/A'}</td>
              <td><StatusPill tone={statusTone[customer.role]}>{customer.role}</StatusPill></td>
              <td>{customer.order_count}</td>
              <td className="font-semibold">{formatCurrency(customer.lifetime_value)}</td>
              <td>{formatDate(customer.created_at)}</td>
              <td><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" iconOnly leftIcon={<Pencil size={16} />} aria-label="Edit customer" onClick={() => openCustomer(customer)} /><Button size="sm" variant="ghost" iconOnly leftIcon={<Trash2 size={16} />} aria-label="Delete customer" onClick={() => deleteMutation.mutate(customer.id)} /></div></td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      <Modal isOpen={!!editingCustomer} onClose={() => setEditingCustomer(null)} title="Edit customer" size="md">
        <ModalBody className="space-y-4">
          <Select label="Role" value={role} onChange={(value) => setRole((value as UserRole | null) ?? 'customer')} options={ROLES.map((item) => ({ label: item.label, value: item.value }))} clearable={false} />
          <label className="flex items-center gap-3 rounded-xl border border-surface-200 p-3 text-sm dark:border-surface-700"><input type="checkbox" checked={banned} onChange={(event) => setBanned(event.target.checked)} className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" /><span className="font-medium">Ban this customer</span></label>
        </ModalBody>
        <ModalFooter className="justify-end"><Button variant="secondary" onClick={() => setEditingCustomer(null)}>Cancel</Button><Button loading={updateMutation.isPending} onClick={() => updateMutation.mutate()}>Save customer</Button></ModalFooter>
      </Modal>
    </div>
  )
}

export function CouponsPage() {
  const queryClient = useQueryClient()
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as CouponType,
    value: '10',
    min_purchase: '',
    max_uses: '',
    starts_at: '',
    expires_at: '',
    is_active: true,
  })
  const couponsQuery = useQuery({ queryKey: ['admin-coupons-page'], queryFn: () => fetchCoupons({ page: 1, limit: 100 }) })
  const coupons = couponsQuery.data?.data ?? []
  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: Partial<Coupon> = {
        code: form.code,
        type: form.type,
        value: Number(form.value) || 0,
        min_purchase: form.min_purchase ? Number(form.min_purchase) : undefined,
        max_uses: form.max_uses ? Number(form.max_uses) : undefined,
        starts_at: form.starts_at || undefined,
        expires_at: form.expires_at || undefined,
        is_active: form.is_active,
      }
      return editingCoupon ? updateCoupon(editingCoupon.id, payload) : createCoupon(payload)
    },
    onSuccess: () => { toast.success('Coupon saved'); setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['admin-coupons-page'] }) },
    onError: (error: Error) => toast.error(error.message),
  })
  const openCoupon = (coupon?: Coupon) => {
    setEditingCoupon(coupon ?? null)
    setForm(coupon ? {
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      min_purchase: coupon.min_purchase ? String(coupon.min_purchase) : '',
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      starts_at: coupon.starts_at?.slice(0, 16) ?? '',
      expires_at: coupon.expires_at?.slice(0, 16) ?? '',
      is_active: coupon.is_active,
    } : { code: '', type: 'percentage', value: '10', min_purchase: '', max_uses: '', starts_at: '', expires_at: '', is_active: true })
    setIsModalOpen(true)
  }
  return (
    <CrudShell title="Coupons" eyebrow="Marketing" description="Create percentage, fixed amount, and free shipping promotions with usage limits." actionLabel="Add Coupon" actionIcon={<Plus size={16} />} onAction={() => openCoupon()}>
      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard label="Coupons" value={coupons.length} helper="Total campaigns" tone="primary" icon={<Gift size={19} />} />
        <AdminMetricCard label="Active" value={coupons.filter((c) => c.is_active).length} helper="Can be redeemed" tone="success" icon={<Check size={19} />} />
        <AdminMetricCard label="Uses" value={coupons.reduce((sum, c) => sum + c.used_count, 0)} helper="Total redemptions" tone="warning" icon={<CreditCard size={19} />} />
      </div>
      <AdminTable isLoading={couponsQuery.isLoading} emptyIcon={<Gift size={24} />} emptyTitle="No coupons yet" emptyDescription="Add a coupon to launch a promotion.">
        <thead className="admin-thead"><tr><th>Code</th><th>Type</th><th>Value</th><th>Usage</th><th>Expires</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
        <tbody>{coupons.map((coupon) => <tr key={coupon.id}><td className="font-semibold">{coupon.code}</td><td>{coupon.type}</td><td>{coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}</td><td>{coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}</td><td>{coupon.expires_at ? formatDate(coupon.expires_at) : 'Never'}</td><td><StatusPill tone={coupon.is_active ? 'success' : 'surface'}>{coupon.is_active ? 'Active' : 'Inactive'}</StatusPill></td><td><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" iconOnly leftIcon={<Pencil size={16} />} aria-label="Edit coupon" onClick={() => openCoupon(coupon)} /><Button size="sm" variant="ghost" iconOnly leftIcon={<Trash2 size={16} />} aria-label="Delete coupon" onClick={() => { deleteCoupon(coupon.id).then(() => queryClient.invalidateQueries({ queryKey: ['admin-coupons-page'] })) }} /></div></td></tr>)}</tbody>
      </AdminTable>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCoupon ? 'Edit coupon' : 'Add coupon'} size="lg">
        <ModalBody className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2"><Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /><Select label="Type" value={form.type} onChange={(value) => setForm({ ...form, type: (value as CouponType | null) ?? 'percentage' })} options={COUPON_TYPES.map((item) => ({ label: item.label, value: item.value }))} clearable={false} /></div>
          <div className="grid gap-4 md:grid-cols-3"><Input label="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /><Input label="Minimum purchase" type="number" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: e.target.value })} /><Input label="Usage limit" type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></div>
          <div className="grid gap-4 md:grid-cols-2"><Input label="Starts at" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /><Input label="Expires at" type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
          <label className="flex items-center gap-3 rounded-xl border border-surface-200 p-3 text-sm dark:border-surface-700"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" /><span className="font-medium">Active</span></label>
        </ModalBody>
        <ModalFooter className="justify-end"><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button loading={saveMutation.isPending} disabled={!form.code} onClick={() => saveMutation.mutate()}>Save coupon</Button></ModalFooter>
      </Modal>
    </CrudShell>
  )
}

export function ReviewsPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<'all' | ReviewStatus>('all')
  const [replying, setReplying] = useState<Review | null>(null)
  const [reply, setReply] = useState('')
  const reviewsQuery = useQuery({ queryKey: ['admin-reviews-page', status], queryFn: () => fetchAdminReviews({ status: status === 'all' ? undefined : status }, { page: 1, limit: 100 }) })
  const reviews = reviewsQuery.data?.data ?? []
  const updateMutation = useMutation({
    mutationFn: ({ id, nextStatus, adminReply }: { id: string; nextStatus: ReviewStatus; adminReply?: string }) => updateReviewStatus(id, nextStatus, adminReply),
    onSuccess: () => { toast.success('Review updated'); setReplying(null); queryClient.invalidateQueries({ queryKey: ['admin-reviews-page'] }) },
    onError: (error: Error) => toast.error(error.message),
  })
  return (
    <CrudShell title="Reviews" eyebrow="Trust" description="Moderate product reviews, approve or reject submissions, delete spam, and reply publicly.">
      <AdminToolbar><Select label="Status" value={status} onChange={(value) => setStatus((value as ReviewStatus | null) ?? 'all')} options={[{ label: 'All statuses', value: 'all' }, ...REVIEW_STATUSES.map((item) => ({ label: item.label, value: item.value }))]} clearable={false} /></AdminToolbar>
      <AdminTable isLoading={reviewsQuery.isLoading} emptyIcon={<Star size={24} />} emptyTitle="No reviews found" emptyDescription="Customer reviews matching this status will appear here.">
        <thead className="admin-thead"><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Review</th><th>Status</th><th>Date</th><th className="text-right">Actions</th></tr></thead>
        <tbody>{reviews.map((review) => <tr key={review.id}><td>{review.product?.name ?? 'Product'}</td><td>{review.user ? `${review.user.first_name} ${review.user.last_name}`.trim() : 'Customer'}</td><td>{review.rating} / 5</td><td><div className="font-medium">{review.title}</div><div className="line-clamp-2 text-xs text-surface-500">{review.comment}</div>{review.admin_reply && <div className="mt-1 text-xs text-primary-600">Reply: {review.admin_reply}</div>}</td><td><StatusPill tone={statusTone[review.status]}>{review.status}</StatusPill></td><td>{formatDate(review.created_at)}</td><td><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" iconOnly leftIcon={<Check size={16} />} aria-label="Approve" onClick={() => updateMutation.mutate({ id: review.id, nextStatus: 'approved' })} /><Button size="sm" variant="ghost" iconOnly leftIcon={<X size={16} />} aria-label="Reject" onClick={() => updateMutation.mutate({ id: review.id, nextStatus: 'rejected' })} /><Button size="sm" variant="ghost" iconOnly leftIcon={<Pencil size={16} />} aria-label="Reply" onClick={() => { setReplying(review); setReply(review.admin_reply ?? '') }} /><Button size="sm" variant="ghost" iconOnly leftIcon={<Trash2 size={16} />} aria-label="Delete" onClick={() => deleteReview(review.id).then(() => queryClient.invalidateQueries({ queryKey: ['admin-reviews-page'] }))} /></div></td></tr>)}</tbody>
      </AdminTable>
      <Modal isOpen={!!replying} onClose={() => setReplying(null)} title="Reply to review" size="md"><ModalBody><Input label="Public reply" asTextarea rows={5} value={reply} onChange={(e) => setReply(e.target.value)} /></ModalBody><ModalFooter className="justify-end"><Button variant="secondary" onClick={() => setReplying(null)}>Cancel</Button><Button onClick={() => replying && updateMutation.mutate({ id: replying.id, nextStatus: replying.status, adminReply: reply })}>Save reply</Button></ModalFooter></Modal>
    </CrudShell>
  )
}

export function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const statsQuery = useQuery({ queryKey: ['analytics-stats'], queryFn: fetchDashboardStats })
  const salesQuery = useQuery({ queryKey: ['analytics-sales', period], queryFn: () => fetchSalesData(period) })
  const topProductsQuery = useQuery({ queryKey: ['analytics-products'], queryFn: () => fetchTopProducts(8) })
  const topCustomersQuery = useQuery({ queryKey: ['analytics-customers'], queryFn: () => fetchTopCustomers(8) })
  const inventoryQuery = useQuery({ queryKey: ['analytics-inventory'], queryFn: fetchInventoryStats })
  const inventoryData = inventoryQuery.data ? [
    { name: 'In stock', value: inventoryQuery.data.in_stock, color: '#20c997' },
    { name: 'Low stock', value: inventoryQuery.data.low_stock, color: '#fcc419' },
    { name: 'Out', value: inventoryQuery.data.out_of_stock, color: '#fa5252' },
  ] : []
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Insights" title="Analytics" description="Track revenue, orders, inventory health, best-selling products, and highest-value customers." actions={<Select value={period} onChange={(value) => setPeriod((value as 'week' | 'month' | 'year' | null) ?? 'month')} options={[{ label: 'Week', value: 'week' }, { label: 'Month', value: 'month' }, { label: 'Year', value: 'year' }]} clearable={false} />} />
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard label="Revenue" value={formatCurrency(statsQuery.data?.total_revenue ?? 0)} helper={`${statsQuery.data?.revenue_change ?? 0}% change`} tone="success" icon={<CreditCard size={19} />} />
        <AdminMetricCard label="Orders" value={statsQuery.data?.total_orders ?? 0} helper={`${statsQuery.data?.orders_change ?? 0}% change`} tone="primary" icon={<FileText size={19} />} />
        <AdminMetricCard label="Customers" value={statsQuery.data?.total_customers ?? 0} helper={`${statsQuery.data?.customers_change ?? 0}% change`} tone="warning" icon={<Users size={19} />} />
        <AdminMetricCard label="Products" value={statsQuery.data?.total_products ?? 0} helper="Active catalog" tone="surface" icon={<Package size={19} />} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2"><h3 className="mb-4 font-semibold">Revenue and Orders</h3><ResponsiveContainer width="100%" height={320}><AreaChart data={salesQuery.data ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Area type="monotone" dataKey="revenue" stroke="#4c6ef5" fill="#dbe4ff" /><Area type="monotone" dataKey="orders" stroke="#20c997" fill="#c3fae8" /></AreaChart></ResponsiveContainer></div>
        <div className="card p-5"><h3 className="mb-4 font-semibold">Inventory Health</h3><ResponsiveContainer width="100%" height={320}><PieChart><Pie data={inventoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>{inventoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <RankList title="Best-selling products" rows={(topProductsQuery.data ?? []).map((p) => ({ label: p.name, value: `${p.total_sold} sold` }))} />
        <RankList title="Best customers" rows={(topCustomersQuery.data ?? []).map((c) => ({ label: `${c.first_name} ${c.last_name}`.trim() || c.user_id, value: formatCurrency(c.total_spent) }))} />
      </div>
    </div>
  )
}

export function InventoryPage() {
  const queryClient = useQueryClient()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState('0')
  const [action, setAction] = useState<InventoryAction>('adjustment')
  const [note, setNote] = useState('')
  const productsQuery = useQuery({
    queryKey: ['admin-inventory-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*, brand:brands(*)').order('stock_quantity', { ascending: true })
      if (error) throw new Error(error.message)
      return (data ?? []) as Product[]
    },
  })
  const products = productsQuery.data ?? []
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct) return
      const previous = selectedProduct.stock_quantity
      const qty = Number(quantity) || 0
      const next = action === 'adjustment' ? qty : action === 'in' || action === 'return' ? previous + qty : previous - qty
      const { error } = await supabase.from('products').update({ stock_quantity: Math.max(0, next) }).eq('id', selectedProduct.id)
      if (error) throw new Error(error.message)
      await supabase.from('inventory_history').insert({ product_id: selectedProduct.id, action, quantity: qty, note, previous_stock: previous, new_stock: Math.max(0, next) })
    },
    onSuccess: () => { toast.success('Inventory adjusted'); setSelectedProduct(null); queryClient.invalidateQueries({ queryKey: ['admin-inventory-products'] }) },
    onError: (error: Error) => toast.error(error.message),
  })
  return (
    <CrudShell title="Inventory" eyebrow="Warehouse" description="Monitor stock, low-stock alerts, out-of-stock products, and record stock adjustments.">
      <div className="grid gap-4 md:grid-cols-4"><AdminMetricCard label="Products" value={products.length} helper="Tracked SKUs" tone="primary" icon={<Package size={19} />} /><AdminMetricCard label="Low Stock" value={products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length} helper="Needs reorder" tone="warning" icon={<AlertTriangle size={19} />} /><AdminMetricCard label="Out" value={products.filter((p) => p.stock_quantity <= 0).length} helper="Unavailable" tone="danger" icon={<X size={19} />} /><AdminMetricCard label="Units" value={products.reduce((sum, p) => sum + p.stock_quantity, 0)} helper="Total on hand" tone="success" icon={<History size={19} />} /></div>
      <AdminTable isLoading={productsQuery.isLoading} emptyIcon={<Package size={24} />} emptyTitle="No inventory found" emptyDescription="Products will appear here when added to the catalog.">
        <thead className="admin-thead"><tr><th>Product</th><th>Brand</th><th>Stock</th><th>Threshold</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
        <tbody>{products.map((product) => { const stock = getStockStatus(product.stock_quantity, product.low_stock_threshold); return <tr key={product.id}><td className="font-semibold">{product.name}</td><td>{product.brand?.name ?? 'No brand'}</td><td>{product.stock_quantity}</td><td>{product.low_stock_threshold}</td><td><StatusPill tone={stock.status === 'in_stock' ? 'success' : stock.status === 'low_stock' ? 'warning' : 'danger'}>{stock.label}</StatusPill></td><td className="text-right"><Button size="sm" variant="secondary" onClick={() => { setSelectedProduct(product); setQuantity(String(product.stock_quantity)); setAction('adjustment'); setNote('') }}>Adjust</Button></td></tr> })}</tbody>
      </AdminTable>
      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="Adjust inventory" size="md"><ModalBody className="space-y-4"><Select label="Action" value={action} onChange={(value) => setAction((value as InventoryAction | null) ?? 'adjustment')} options={['adjustment', 'in', 'out', 'return'].map((item) => ({ label: item, value: item }))} clearable={false} /><Input label={action === 'adjustment' ? 'New stock quantity' : 'Quantity'} type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /><Input label="Note" asTextarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></ModalBody><ModalFooter className="justify-end"><Button variant="secondary" onClick={() => setSelectedProduct(null)}>Cancel</Button><Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save adjustment</Button></ModalFooter></Modal>
    </CrudShell>
  )
}

export function MediaPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [folder, setFolder] = useState('')
  const mediaQuery = useQuery({ queryKey: ['admin-media', folder], queryFn: () => listMedia(folder || undefined, 100) })
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => Promise.all(files.map(async (file) => {
      const uploaded = await uploadMedia(file, folder || undefined)
      await supabase.from('media').insert({ name: uploaded.name, url: uploaded.url, type: uploaded.type, size: uploaded.size, folder })
      return uploaded
    })),
    onSuccess: () => { toast.success('Media uploaded'); queryClient.invalidateQueries({ queryKey: ['admin-media'] }) },
    onError: (error: Error) => toast.error(error.message),
  })
  return (
    <CrudShell title="File Manager" eyebrow="Assets" description="Upload and organize images, videos, PDFs, and documents for the storefront." actionLabel="Upload" actionIcon={<Upload size={16} />} onAction={() => fileInputRef.current?.click()}>
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files ?? []); if (files.length) uploadMutation.mutate(files); e.target.value = '' }} />
      <AdminToolbar><Input label="Folder" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="homepage, products, docs" /></AdminToolbar>
      {mediaQuery.isLoading ? <div className="card p-6 text-sm text-surface-500">Loading media...</div> : (mediaQuery.data ?? []).length === 0 ? <EmptyAdminState icon={<FolderOpen size={24} />} title="No files found" description="Upload assets into this folder to build your media library." /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{(mediaQuery.data ?? []).map((item) => <MediaCard key={`${item.folder}-${item.name}`} item={item} onDelete={() => deleteMedia([folder ? `${folder}/${item.name}` : item.name]).then(() => queryClient.invalidateQueries({ queryKey: ['admin-media'] }))} />)}</div>}
    </CrudShell>
  )
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const settingsQuery = useQuery({ queryKey: ['admin-settings-map'], queryFn: fetchSettings })
  const [form, setForm] = useState<Record<string, string>>({})
  const current = settingsQuery.data ?? {}
  const keys = ['store_name', 'logo_url', 'hero_banner_url', 'contact_email', 'contact_phone', 'social_instagram', 'shipping_methods', 'tax_rate', 'payment_methods', 'footer_text']
  const valueFor = (key: string) => form[key] ?? current[key]?.value ?? ''
  const saveMutation = useMutation({
    mutationFn: () => updateSettings(keys.map((key) => ({ key, value: valueFor(key), type: key === 'tax_rate' ? 'number' : 'string' as SettingsRecord['type'] }))),
    onSuccess: () => { toast.success('Settings saved'); queryClient.invalidateQueries({ queryKey: ['admin-settings-map'] }); queryClient.invalidateQueries({ queryKey: ['settings'] }) },
    onError: (error: Error) => toast.error(error.message),
  })
  return (
    <div className="space-y-6"><AdminPageHeader eyebrow="Configuration" title="Website Settings" description="Edit store identity, homepage content, footer, contact details, shipping, tax, and payment method copy." actions={<Button leftIcon={<Settings size={16} />} loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save Settings</Button>} />
      <div className="card p-5"><div className="grid gap-4 md:grid-cols-2">{keys.map((key) => <Input key={key} label={key.replace(/_/g, ' ')} value={valueFor(key)} onChange={(e) => setForm({ ...form, [key]: e.target.value })} asTextarea={['shipping_methods', 'payment_methods', 'footer_text'].includes(key)} rows={3} />)}</div></div>
    </div>
  )
}

export function RolesPage() {
  return (
    <div className="space-y-6"><AdminPageHeader eyebrow="Access" title="Roles & Permissions" description="Role matrix for super admins, admins, managers, employees, and customers." />
      <div className="grid gap-4 md:grid-cols-5">
        {ROLES.map((role) => (
          <AdminMetricCard
            key={role.value}
            label={role.label}
            value={role.value === 'super_admin' || role.value === 'admin' ? 'Admin' : isStaffRole(role.value) ? 'Staff' : 'Store only'}
            helper={role.description}
            tone={statusTone[role.value]}
            icon={<Shield size={19} />}
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[860px]">
            <thead className="admin-thead">
              <tr><th>Module</th>{ROLES.map((role) => <th key={role.value}>{role.label}</th>)}</tr>
            </thead>
            <tbody>
              {ADMIN_MODULES.map((module) => (
                <tr key={module}>
                  <td className="font-semibold capitalize">{module}</td>
                  {ROLES.map((role) => {
                    const allowed = hasAdminPermission(role.value, module)
                    return <td key={role.value}>{allowed ? <Check size={17} className="text-success-600" aria-label="Allowed" /> : <X size={17} className="text-surface-300" aria-label="Not allowed" />}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CrudShell({ title, eyebrow, description, actionLabel, actionIcon, onAction, children }: { title: string; eyebrow: string; description: string; actionLabel?: string; actionIcon?: React.ReactNode; onAction?: () => void; children: React.ReactNode }) {
  return <div className="space-y-6"><AdminPageHeader eyebrow={eyebrow} title={title} description={description} actions={actionLabel && onAction ? <Button leftIcon={actionIcon} onClick={onAction}>{actionLabel}</Button> : undefined} />{children}</div>
}

function AdminTable({ isLoading, emptyIcon, emptyTitle, emptyDescription, children }: { isLoading: boolean; emptyIcon: React.ReactNode; emptyTitle: string; emptyDescription: string; children: React.ReactNode }) {
  if (isLoading) return <div className="card p-6 text-sm text-surface-500">Loading...</div>
  const body = Array.isArray(children) ? children[1] : null
  const hasRows = !body || true
  if (!hasRows) return <EmptyAdminState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
  return <div className="overflow-hidden rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900"><div className="overflow-x-auto"><table className="admin-table min-w-[980px]">{children}</table></div></div>
}

function AdminPager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  if (totalPages <= 1) return null
  return <div className="flex items-center justify-end gap-2 text-sm"><Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button><span className="text-surface-500">Page {page} of {totalPages}</span><Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button></div>
}

function RankList({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return <div className="card p-5"><h3 className="mb-4 font-semibold">{title}</h3><div className="space-y-2">{rows.length === 0 ? <p className="text-sm text-surface-500">No data yet</p> : rows.map((row, index) => <div key={`${row.label}-${index}`} className="flex items-center justify-between rounded-xl bg-surface-50 px-3 py-2 text-sm dark:bg-surface-800"><span className="font-medium">{index + 1}. {row.label}</span><span className="text-surface-500">{row.value}</span></div>)}</div></div>
}

function MediaCard({ item, onDelete }: { item: Media; onDelete: () => void }) {
  return <div className="card overflow-hidden"><div className="aspect-square bg-surface-100 dark:bg-surface-800">{item.type === 'image' ? <img src={item.url} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-surface-400"><FileText size={40} /></div>}</div><div className="p-3"><div className="truncate text-sm font-semibold">{item.name}</div><div className="mt-1 flex items-center justify-between text-xs text-surface-500"><span>{item.type as MediaType}</span><span>{formatFileSize(item.size)}</span></div><Button size="sm" variant="ghost" className="mt-2 w-full" leftIcon={<Trash2 size={14} />} onClick={onDelete}>Delete</Button></div></div>
}
