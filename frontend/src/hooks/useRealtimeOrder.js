import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

import apiClient from '../lib/apiClient'

/**
 * Subscribe to real-time order status updates for a given order ID.
 * Powered by Supabase Realtime and falls back to polling for local database testing.
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

    // Initial fetch from our live FastAPI backend
    apiClient.get(`/api/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data)
      })
      .catch((err) => {
        console.error("Failed to fetch order:", err)
      })
      .finally(() => {
        setLoading(false)
      })

    // Try subscribing to changes if supabase is configured
    let channel = null
    const isMock = import.meta.env.VITE_SUPABASE_URL?.includes('your-project-ref')
    if (!isMock) {
      try {
        channel = supabase
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
      } catch (err) {
        console.warn("Supabase Realtime not available:", err)
      }
    }

    // Polling fallback so database order tracking works locally
    const interval = setInterval(() => {
      apiClient.get(`/api/orders/${orderId}`)
        .then((res) => {
          setOrder(res.data)
        })
        .catch(console.error)
    }, 4000)

    return () => {
      clearInterval(interval)
      if (channel) {
        try {
          supabase.removeChannel(channel)
        } catch (e) {}
      }
    }
  }, [orderId])

  return {
    order,
    status: order?.status ?? null,
    loading,
  }
}
