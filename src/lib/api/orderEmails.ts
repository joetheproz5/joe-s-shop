import { supabase } from '@/lib/supabase'

export type OrderEmailEvent = 'placed' | 'status_updated'

export async function notifyOrderCustomer(orderId: string, event: OrderEmailEvent) {
  try {
    const { data, error } = await supabase.functions.invoke('order-email', {
      body: { order_id: orderId, event },
    })
    if (error) throw error
    return { sent: true, data, error: null }
  } catch (error) {
    console.error('Order email could not be sent', error)
    return { sent: false, data: null, error }
  }
}
