import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Subscribe to real-time order status updates for a given order ID.
 * Powered by Supabase Realtime postgres_changes.
 *
 * @param {string|null} orderId - The order UUID to track
 * @returns {{ order: object|null, status: string|null, loading: boolean }}
 */
export function useRealtimeOrder(orderId) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    // Initial fetch
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()
      .then(({ data }) => {
        setOrder(data)
        setLoading(false)
      })

    // Subscribe to changes
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...payload.new }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  return {
    order,
    status: order?.status ?? null,
    loading,
  }
}
