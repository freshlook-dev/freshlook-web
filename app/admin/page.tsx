'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type OrderSummary = {
  id: string
  total: number | null
  full_name?: string | null
  customer_name?: string | null
}

type AppointmentSummary = {
  id: string
  client_name: string | null
  appointment_time: string | null
}

type DashboardStats = {
  orders: number
  revenue: number
  appointments: number
  users: number
}

type CardProps = {
  title: string
  value: string | number
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    orders: 0,
    revenue: 0,
    appointments: 0,
    users: 0,
  })

  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([])
  const [recentAppointments, setRecentAppointments] = useState<AppointmentSummary[]>([])

  async function fetchData() {
    const { data: orders } = await supabase.from('orders').select('*')
    const revenue = orders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0

    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')

    const { data: users } = await supabase.from('profiles').select('*')

    setStats({
      orders: orders?.length || 0,
      revenue,
      appointments: appointments?.length || 0,
      users: users?.length || 0,
    })

    setRecentOrders((orders?.slice(0, 5) as OrderSummary[]) || [])
    setRecentAppointments((appointments?.slice(0, 5) as AppointmentSummary[]) || [])
  }

  useEffect(() => {
    const initialFetch = window.setTimeout(() => {
      void fetchData()
    }, 0)

    return () => window.clearTimeout(initialFetch)
  }, [])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-playfair">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Revenue" value={`EUR ${stats.revenue.toFixed(2)}`} />
        <Card title="Orders" value={stats.orders} />
        <Card title="Appointments" value={stats.appointments} />
        <Card title="Users" value={stats.users} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="font-semibold mb-4">Recent Orders</h2>

          <div className="space-y-3 text-sm">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between border-b pb-2"
              >
                <span>{order.full_name || order.customer_name || 'Client'}</span>
                <span className="text-[#C6A96B] font-medium">
                  EUR {(order.total || 0).toFixed(2)}
                </span>
              </div>
            ))}

            {recentOrders.length === 0 && (
              <p className="text-gray-400">No orders yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="font-semibold mb-4">Appointments</h2>

          <div className="space-y-3 text-sm">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex justify-between border-b pb-2"
              >
                <span>{appointment.client_name || 'Client'}</span>
                <span className="text-gray-500">
                  {appointment.appointment_time || '-'}
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

function Card({ title, value }: CardProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-semibold text-[#C6A96B] mt-1">
        {value}
      </h2>
    </div>
  )
}
