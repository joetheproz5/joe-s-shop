import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Missing Supabase service configuration' }, 500)
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userError } = await userClient.auth.getUser()
  if (userError || !userData.user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (!profile || !['super_admin', 'admin', 'manager', 'employee'].includes(profile.role)) {
    return jsonResponse({ error: 'Forbidden' }, 403)
  }

  const [lowStock, pendingOrders, pendingReviews] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, stock_quantity, low_stock_threshold')
      .eq('status', 'active')
      .lte('stock_quantity', 10)
      .order('stock_quantity', { ascending: true })
      .limit(10),
    supabase
      .from('orders')
      .select('id, order_number, total, created_at')
      .in('status', ['pending', 'paid', 'processing'])
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('reviews')
      .select('id, title, rating, created_at, product:products(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const firstError = [lowStock.error, pendingOrders.error, pendingReviews.error].find(Boolean)
  if (firstError) {
    return jsonResponse({ error: firstError.message }, 400)
  }

  return jsonResponse({
    low_stock: lowStock.data ?? [],
    pending_orders: pendingOrders.data ?? [],
    pending_reviews: pendingReviews.data ?? [],
  })
})
