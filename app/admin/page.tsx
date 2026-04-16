'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AdminPage() {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    appointments: 0,
    users: 0,
  })

  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentAppointments, setRecentAppointments] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // ORDERS
    const { data: orders } = await supabase.from('orders').select('*')
    const revenue = orders?.reduce((acc, o) => acc + (o.total || 0), 0) || 0

    // APPOINTMENTS
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')

    // USERS
    const { data: users } = await supabase.from('profiles').select('*')

    setStats({
      orders: orders?.length || 0,
      revenue,
      appointments: appointments?.length || 0,
      users: users?.length || 0,
    })

    setRecentOrders(orders?.slice(0, 5) || [])
    setRecentAppointments(appointments?.slice(0, 5) || [])
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <h1 className="text-2xl md:text-3xl font-playfair">
        Dashboard
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card title="Revenue" value={`€${stats.revenue}`} />
        <Card title="Orders" value={stats.orders} />
        <Card title="Appointments" value={stats.appointments} />
        <Card title="Users" value={stats.users} />

      </div>

      {/* CONTENT */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* RECENT ORDERS */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="font-semibold mb-4">Recent Orders</h2>

          <div className="space-y-3 text-sm">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex justify-between border-b pb-2"
              >
                <span>{o.customer_name || 'Client'}</span>
                <span className="text-[#C6A96B] font-medium">
                  €{o.total}
                </span>
              </div>
            ))}

            {recentOrders.length === 0 && (
              <p className="text-gray-400">No orders yet</p>
            )}
          </div>
        </div>

        {/* RECENT APPOINTMENTS */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="font-semibold mb-4">Appointments</h2>

          <div className="space-y-3 text-sm">
            {recentAppointments.map((a) => (
              <div
                key={a.id}
                className="flex justify-between border-b pb-2"
              >
                <span>{a.client_name}</span>
                <span className="text-gray-500">
                  {a.appointment_time}
                </span>
              </div>
            ))}

            {recentAppointments.length === 0 && (
              <p className="text-gray-400">No appointments</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

/* CARD COMPONENT */
function Card({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-semibold text-[#C6A96B] mt-1">
        {value}
      </h2>
    </div>
  )
}