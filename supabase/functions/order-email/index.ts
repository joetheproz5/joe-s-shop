import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

type OrderEmailEvent = 'placed' | 'status_updated'

type OrderAddress = {
  first_name?: string
  last_name?: string
  street_address_1?: string
  street_address_2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  email?: string
}

type OrderItem = {
  product_name: string
  product_image?: string | null
  quantity: number
  unit_price: number
  total_price: number
}

const STATUS_COPY: Record<string, { subject: string; heading: string; message: string }> = {
  pending: { subject: 'Order received', heading: 'We received your order', message: 'Your order is confirmed and waiting to be processed.' },
  paid: { subject: 'Payment confirmed', heading: 'Your payment is confirmed', message: 'Payment has been recorded for your order.' },
  processing: { subject: 'Order in progress', heading: 'We are preparing your order', message: 'Your items are now being prepared for delivery.' },
  shipped: { subject: 'Order on the way', heading: 'Your order has shipped', message: 'Your order has left us and is on its way to you.' },
  delivered: { subject: 'Order delivered', heading: 'Your order was delivered', message: 'We hope everything arrived exactly as expected.' },
  cancelled: { subject: 'Order cancelled', heading: 'Your order was cancelled', message: 'This order has been cancelled. Contact support if you need help.' },
  refunded: { subject: 'Order refunded', heading: 'Your order was refunded', message: 'A refund has been recorded for this order.' },
}

const PAYMENT_COPY: Record<string, { subject: string; heading: string; message: string }> = {
  paid: { subject: 'Payment confirmed', heading: 'Your payment is confirmed', message: 'Payment has been recorded for your order.' },
  failed: { subject: 'Payment failed', heading: 'Your payment was not completed', message: 'Payment for this order failed. Contact support if you need help.' },
  refunded: { subject: 'Payment refunded', heading: 'Your payment was refunded', message: 'A refund has been recorded for this order.' },
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function money(value: unknown) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
}

function buildEmail(order: Record<string, unknown>, items: OrderItem[], recipientName: string, event: OrderEmailEvent) {
  const status = String(order.status || 'pending')
  const paymentStatus = String(order.payment_status || 'pending')
  const paymentCopy = PAYMENT_COPY[paymentStatus]
  const copy = event === 'placed'
    ? STATUS_COPY.pending
    : paymentStatus === 'failed' || paymentStatus === 'refunded'
      ? paymentCopy
      : paymentStatus === 'paid' && ['pending', 'processing'].includes(status)
        ? paymentCopy
        : (STATUS_COPY[status] || paymentCopy || STATUS_COPY.processing)
  const address = (order.shipping_address || {}) as OrderAddress
  const siteUrl = Deno.env.get('SITE_URL') || 'https://joetheproz5.github.io/joe-s-shop'
  const orderNumber = String(order.order_number || '')
  const addressLines = [
    address.street_address_1,
    address.street_address_2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean).map((line) => escapeHtml(line)).join('<br />')

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #e5e7eb">
        <div style="display:flex;align-items:center;gap:12px">
          ${item.product_image ? `<img src="${escapeHtml(item.product_image)}" width="52" height="52" alt="" style="width:52px;height:52px;object-fit:contain;border:1px solid #e5e7eb;border-radius:8px;background:#fff" />` : ''}
          <div><strong>${escapeHtml(item.product_name)}</strong><div style="margin-top:4px;color:#6b7280;font-size:13px">Qty ${item.quantity} | ${money(item.unit_price)}</div></div>
        </div>
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${money(item.total_price)}</td>
    </tr>`).join('')

  return {
    subject: `${copy.subject} | ${orderNumber}`,
    html: `<!doctype html><html><body style="margin:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#202124">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px">
        <div style="background:#fff;border:1px solid #e0e4e8;border-radius:12px;overflow:hidden">
          <div style="padding:24px 28px;border-bottom:1px solid #e5e7eb"><a href="${siteUrl}" style="color:#0b57d0;text-decoration:none;font-size:20px;font-weight:700">Joe's Shop</a></div>
          <div style="padding:32px 28px">
            <p style="margin:0 0 10px;color:#0b57d0;font-size:13px;font-weight:700;text-transform:uppercase">Order ${escapeHtml(orderNumber)}</p>
            <h1 style="margin:0;font-size:28px;line-height:1.2">${copy.heading}</h1>
            <p style="margin:14px 0 0;color:#5f6368;line-height:1.6">Hi ${escapeHtml(recipientName || 'there')}, ${copy.message}</p>
            <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:26px">${itemRows}</table>
            <table role="presentation" style="width:100%;margin-top:22px;border-collapse:collapse">
              <tr><td style="padding:5px 0;color:#6b7280">Subtotal</td><td style="padding:5px 0;text-align:right">${money(order.subtotal)}</td></tr>
              <tr><td style="padding:5px 0;color:#6b7280">Shipping</td><td style="padding:5px 0;text-align:right">${Number(order.shipping_cost || 0) === 0 ? 'Free' : money(order.shipping_cost)}</td></tr>
              <tr><td style="padding:12px 0 0;font-size:18px;font-weight:700">Total</td><td style="padding:12px 0 0;text-align:right;font-size:18px;font-weight:700">${money(order.total)}</td></tr>
            </table>
            ${addressLines ? `<div style="margin-top:26px;padding:18px;background:#f8fafc;border-radius:8px"><strong style="display:block;margin-bottom:8px">Delivery address</strong><div style="color:#5f6368;line-height:1.6">${addressLines}</div></div>` : ''}
            <a href="${order.user_id ? `${siteUrl}/account/orders` : siteUrl}" style="display:inline-block;margin-top:26px;padding:12px 18px;border-radius:8px;background:#0b57d0;color:#fff;text-decoration:none;font-weight:700">${order.user_id ? 'View orders' : 'Continue shopping'}</a>
          </div>
        </div>
        <p style="margin:18px 0 0;text-align:center;color:#80868b;font-size:12px">This is a transactional message about your Joe's Shop order.</p>
      </div>
    </body></html>`,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!supabaseUrl || !serviceRoleKey || !anonKey || !resendKey) {
    return jsonResponse({ error: 'Missing email service configuration' }, 500)
  }

  const body = await req.json().catch(() => null) as { order_id?: string; event?: OrderEmailEvent } | null
  if (!body?.order_id || !['placed', 'status_updated'].includes(body.event || '')) {
    return jsonResponse({ error: 'order_id and a valid event are required' }, 400)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', body.order_id)
    .single()
  if (orderError || !order) return jsonResponse({ error: 'Order not found' }, 404)

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const { data: authData } = token ? await admin.auth.getUser(token) : { data: { user: null } }
  const caller = authData.user

  if (body.event === 'status_updated') {
    if (!caller) return jsonResponse({ error: 'Unauthorized' }, 401)
    const { data: profile } = await admin.from('profiles').select('role').eq('id', caller.id).single()
    if (!profile || !['super_admin', 'admin', 'manager', 'employee'].includes(profile.role)) {
      return jsonResponse({ error: 'Forbidden' }, 403)
    }
  } else if (order.user_id && caller?.id !== order.user_id) {
    return jsonResponse({ error: 'Forbidden' }, 403)
  } else if (!order.user_id) {
    const createdAt = new Date(order.created_at).getTime()
    if (!Number.isFinite(createdAt) || Date.now() - createdAt > 10 * 60 * 1000) {
      return jsonResponse({ error: 'Guest confirmation window expired' }, 403)
    }
  }

  const address = (order.shipping_address || {}) as OrderAddress
  let recipient = order.guest_email || address.email || ''
  if (!recipient && order.user_id) {
    const { data: userData } = await admin.auth.admin.getUserById(order.user_id)
    recipient = userData.user?.email || ''
  }
  if (!recipient) return jsonResponse({ error: 'No customer email is available for this order' }, 400)

  const recipientName = [address.first_name, address.last_name].filter(Boolean).join(' ')
  const email = buildEmail(order, (order.items || []) as OrderItem[], recipientName, body.event)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
      'Idempotency-Key': `order-${order.id}-${body.event}-${order.status}-${order.payment_status}`,
    },
    body: JSON.stringify({
      from: Deno.env.get('ORDER_EMAIL_FROM') || "Joe's Shop <orders@resend.dev>",
      to: [recipient],
      subject: email.subject,
      html: email.html,
      tags: [{ name: 'order_event', value: body.event }],
    }),
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok) return jsonResponse({ error: result?.message || 'Email provider rejected the message' }, 502)
  return jsonResponse({ ok: true, email_id: result.id })
})
