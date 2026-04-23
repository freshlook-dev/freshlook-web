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
  full_name: string
  phone: string
  address: string
  instructions: string
  payment_method: string
  items: OrderItem[]
  subtotal: number
  total: number
  status: string
  created_at: string
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setOrders(data as Order[])
    }

    setLoading(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchOrders()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    void fetchOrders()
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-playfair">Orders Management</h1>

      {loading && <p>Loading...</p>}

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl bg-white p-5 shadow">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">{order.full_name}</p>
                <p className="text-sm text-gray-500">{order.phone}</p>
              </div>

              <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                {order.status}
              </span>
            </div>

            <p className="mb-2 text-sm">
              <strong>Address:</strong> {order.address}
            </p>

            {order.instructions && (
              <p className="mb-2 text-sm">
                <strong>Instructions:</strong> {order.instructions}
              </p>
            )}

            <p className="mb-2 text-sm">
              <strong>Payment:</strong> {order.payment_method}
            </p>

            <div className="mt-3 border-t pt-3">
              <p className="mb-2 font-semibold">Items:</p>

              {order.items?.map((item, index) => (
                <div key={index} className="mb-1 flex justify-between text-sm">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>EUR {item.price}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>EUR {order.total}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => updateStatus(order.id, 'delivered')}
                className="rounded bg-green-500 px-3 py-1 text-white"
              >
                Delivered
              </button>

              <button
                onClick={() => updateStatus(order.id, 'canceled')}
                className="rounded bg-red-500 px-3 py-1 text-white"
              >
                Cancel
              </button>

              <button
                onClick={() => updateStatus(order.id, 'pending')}
                className="rounded bg-yellow-500 px-3 py-1 text-white"
              >
                Pending
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
