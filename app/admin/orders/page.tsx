'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type OrderItem = {
  name: string
  quantity: number
  price: number
}

type Order = {
  id: string
  created_at: string
  status: string
  total: number
  subtotal: number
  discount: number
  promo_code: string | null
  full_name: string
  phone: string
  address: string
  items: OrderItem[]
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function fetchOrders() {
    const { data, error: queryError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (queryError) {
      setError(queryError.message)
      return
    }

    setOrders((data as Order[]) || [])
  }

  useEffect(() => {
    const initialFetch = window.setTimeout(() => {
      void fetchOrders()
    }, 0)

    return () => window.clearTimeout(initialFetch)
  }, [])

  const updateStatus = async (id: string, status: string) => {
    setError(null)
    setSuccess(null)

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess('Order updated')
    void fetchOrders()
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('Delete this order?')) return

    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setSuccess('Order deleted')
    void fetchOrders()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      <div className="grid gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-5 rounded-xl shadow space-y-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold">
                  Order #{order.id.slice(0, 6)}
                </h2>
                <p className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => deleteOrder(order.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>{order.full_name}</strong></p>
              <p>{order.phone}</p>
              <p>{order.address}</p>
            </div>

            <div className="text-sm border-t pt-3 space-y-1">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>
                    {item.quantity} x EUR {item.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>EUR {order.subtotal?.toFixed(2)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount {order.promo_code && `(${order.promo_code})`}
                  </span>
                  <span>-EUR {order.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold text-[#C6A96B]">
                <span>Total</span>
                <span>EUR {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
