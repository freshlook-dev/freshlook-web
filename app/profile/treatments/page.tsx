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

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['arrived', 'completed'])
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

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString()
    } catch {
      return date
    }
  }

  return (
    <div className="min-h-screen bg-[#F7EEDF] p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* HEADER */}
        <button
          onClick={() => router.push('/profile')}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold">Treatment History</h1>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-gray-400 py-10">
            Loading your treatments...
          </div>
        )}

        {/* EMPTY */}
        {!loading && appointments.length === 0 && (
          <div className="bg-[#F7EEDF] border border-[#e5dccb] p-6 rounded-3xl text-center text-gray-400 shadow-md">
            No treatments yet
          </div>
        )}

        {/* LIST */}
        <div className="space-y-4">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="bg-[#F7EEDF] border border-[#e5dccb] p-5 rounded-3xl shadow-md hover:shadow-lg transition"
            >
              {/* TOP */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{a.service}</h3>

                <span className={`text-sm capitalize ${getStatusColor(a.status)}`}>
                  {a.status}
                </span>
              </div>

              {/* LOCATION */}
              <p className="text-sm text-gray-600">
                📍 {a.location}
              </p>

              {/* DATE */}
              <p className="text-sm text-gray-600">
                📅 {formatDate(a.appointment_date)} • {a.appointment_time?.slice(0, 5)}
              </p>

              {/* PRICE */}
              {a.total_amount && (
                <p className="text-sm text-[#C6A96B] font-semibold mt-2">
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