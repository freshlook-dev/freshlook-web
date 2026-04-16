'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Order = {
  id: string
  full_name: string
  phone: string
  address: string
  instructions: string
  payment_method: string
  items: any[]
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

    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    fetchOrders()
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">

      <h1 className="text-3xl font-playfair mb-6">
        Orders Management
      </h1>

      {loading && <p>Loading...</p>}

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl shadow p-5"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold">{order.full_name}</p>
                <p className="text-sm text-gray-500">{order.phone}</p>
              </div>

              <span className="text-sm bg-gray-100 px-3 py-1 rounded">
                {order.status}
              </span>
            </div>

            {/* ADDRESS */}
            <p className="text-sm mb-2">
              <strong>Address:</strong> {order.address}
            </p>

            {order.instructions && (
              <p className="text-sm mb-2">
                <strong>Instructions:</strong> {order.instructions}
              </p>
            )}

            <p className="text-sm mb-2">
              <strong>Payment:</strong> {order.payment_method}
            </p>

            {/* ITEMS */}
            <div className="mt-3 border-t pt-3">
              <p className="font-semibold mb-2">Items:</p>

              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between text-sm mb-1"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>€{item.price}</span>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="mt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>€{order.total}</span>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4">

              <button
                onClick={() => updateStatus(order.id, 'delivered')}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Delivered
              </button>

              <button
                onClick={() => updateStatus(order.id, 'canceled')}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => updateStatus(order.id, 'pending')}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
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