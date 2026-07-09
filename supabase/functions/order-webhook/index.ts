import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

type WebhookPayload = {
  order_id?: string
  order_number?: string
  status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
  provider?: string
  event_id?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const expectedSecret = Deno.env.get('ORDER_WEBHOOK_SECRET')
  if (expectedSecret) {
    const receivedSecret = req.headers.get('x-webhook-secret')
    if (receivedSecret !== expectedSecret) {
      return jsonResponse({ error: 'Invalid webhook secret' }, 401)
    }
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Missing Supabase service configuration' }, 500)
  }

  const payload = await req.json().catch(() => null) as WebhookPayload | null
  if (!payload || (!payload.order_id && !payload.order_number)) {
    return jsonResponse({ error: 'order_id or order_number is required' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const updates: Record<string, unknown> = {}

  if (payload.status) updates.status = payload.status
  if (payload.payment_status) updates.payment_status = payload.payment_status
  if (payload.status === 'paid' || payload.payment_status === 'paid') updates.paid_at = new Date().toISOString()
  if (payload.status === 'shipped') updates.shipped_at = new Date().toISOString()
  if (payload.status === 'delivered') updates.delivered_at = new Date().toISOString()
  if (payload.status === 'cancelled') updates.cancelled_at = new Date().toISOString()
  if (payload.status === 'refunded' || payload.payment_status === 'refunded') updates.refunded_at = new Date().toISOString()
  updates.internal_note = [
    payload.provider ? `Provider: ${payload.provider}` : null,
    payload.event_id ? `Event: ${payload.event_id}` : null,
  ].filter(Boolean).join(' | ') || undefined

  let query = supabase.from('orders').update(updates)
  query = payload.order_id ? query.eq('id', payload.order_id) : query.eq('order_number', payload.order_number)

  const { data, error } = await query.select('id, order_number, status, payment_status').single()

  if (error) {
    return jsonResponse({ error: error.message }, 400)
  }

  return jsonResponse({ ok: true, order: data })
})
