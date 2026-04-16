'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Appointment = {
  id: string
  service: string
  appointment_date: string
  appointment_time: string
  location: string
  status: string
  total_amount: number | null
}

export default function TreatmentHistoryPage() {
  const router = useRouter()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // ✅ CORRECT QUERY (USES user_id)
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: false })

    if (!error && data) {
      setAppointments(data)
    }

    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    if (status === 'completed' || status === 'arrived') return 'text-green-600'
    if (status === 'cancelled') return 'text-red-500'
    return 'text-yellow-600'
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* HEADER */}
        <button
          onClick={() => router.push('/profile')}
          className="text-sm text-gray-500"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold">Treatment History</h1>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-gray-400 py-10">
            Loading...
          </div>
        )}

        {/* EMPTY */}
        {!loading && appointments.length === 0 && (
          <div className="bg-white p-6 rounded-2xl text-center text-gray-400 shadow">
            No treatments yet
          </div>
        )}

        {/* LIST */}
        <div className="space-y-4">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="bg-white p-5 rounded-2xl shadow space-y-2"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{a.service}</h3>
                <span className={`text-sm ${getStatusColor(a.status)}`}>
                  {a.status}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                📍 {a.location}
              </p>

              <p className="text-sm text-gray-500">
                📅 {new Date(a.appointment_date).toLocaleDateString()} • {a.appointment_time}
              </p>

              {a.total_amount && (
                <p className="text-sm text-[#C6A96B] font-medium">
                  €{a.total_amount}
                </p>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}