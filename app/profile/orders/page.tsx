'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  items: OrderItem[]
}

export default function OrdersPage() {
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setOrders((data as Order[]) || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchOrders()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchOrders])

  const getStatusStyle = (status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'cancelled') return 'bg-red-100 text-red-600'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="min-h-screen bg-[#F7EEDF] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/profile')}
            className="text-sm text-gray-500 hover:text-black"
          >
            Back
          </button>

          <h1 className="text-xl sm:text-2xl font-semibold">
            Purchase History
          </h1>

          <div />
        </div>

        {loading && (
          <p className="text-gray-500 text-sm text-center">
            Loading orders...
          </p>
        )}

        {!loading && orders.length === 0 && (
          <div className="bg-[#F7EEDF] border border-[#e5dccb] p-6 rounded-3xl text-center text-gray-400 shadow-md">
            No orders yet
          </div>
        )}

        {orders.map((order) => {
          const isOpen = expanded === order.id

          return (
            <div
              key={order.id}
              className="bg-[#F7EEDF] border border-[#e5dccb] rounded-3xl shadow-md p-5 space-y-3 hover:shadow-lg transition"
            >
              <div
                onClick={() => setExpanded(isOpen ? null : order.id)}
                className="flex justify-between items-center cursor-pointer"
              >
                <div>
                  <p className="font-medium">
                    Order #{order.id.slice(0, 6)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                  <span className="text-gray-400 text-lg">
                    {isOpen ? '-' : '+'}
                  </span>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-[#e5dccb] pt-3 space-y-2 text-sm">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-gray-700"
                    >
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>
                        EUR {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-right font-semibold text-[#C6A96B] text-lg">
                EUR {order.total?.toFixed(2)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
