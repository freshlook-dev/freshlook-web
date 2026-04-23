'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Booking = {
  id: string
  client_name: string
  email: string | null
  phone: string | null
  service: string | null
  appointment_date: string
  appointment_time: string
  location: string
  status: string
  total_amount: number | null
  source: string | null
}

type SortType = 'latest' | 'earliest' | 'today'

const locationOptions = ['Prishtine', 'Fushe Kosove']

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sortType, setSortType] = useState<SortType>('latest')

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')

    if (!error && data) {
      setBookings(data as Booking[])
    }

    setLoading(false)
  }

  useEffect(() => {
    const initialFetch = window.setTimeout(() => {
      void fetchBookings()
    }, 0)

    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          void fetchBookings()
        }
      )
      .subscribe()

    return () => {
      window.clearTimeout(initialFetch)
      void supabase.removeChannel(channel)
    }
  }, [])

  const filtered = useMemo(() => {
    let data = [...bookings]

    if (search) {
      const query = search.toLowerCase()
      data = data.filter(
        (booking) =>
          booking.client_name?.toLowerCase().includes(query) ||
          booking.email?.toLowerCase().includes(query) ||
          booking.phone?.toLowerCase().includes(query) ||
          booking.service?.toLowerCase().includes(query)
      )
    }

    if (dateFilter) {
      data = data.filter((booking) => booking.appointment_date === dateFilter)
    }

    if (locationFilter) {
      data = data.filter((booking) => booking.location === locationFilter)
    }

    if (sourceFilter) {
      data = data.filter((booking) => booking.source === sourceFilter)
    }

    if (sortType === 'today') {
      const today = new Date().toISOString().split('T')[0]
      data = data.filter((booking) => booking.appointment_date === today)
    } else {
      data.sort((a, b) => {
        const aTime = new Date(a.appointment_date).getTime()
        const bTime = new Date(b.appointment_date).getTime()
        return sortType === 'latest' ? bTime - aTime : aTime - bTime
      })
    }

    return data
  }, [bookings, search, dateFilter, locationFilter, sourceFilter, sortType])

  if (loading) {
    return <div className="p-6">Loading bookings...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Bookings</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-64"
        />

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Locations</option>
          {locationOptions.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="app">Staff App</option>
        </select>

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as SortType)}
          className="border p-2 rounded"
        >
          <option value="latest">Latest</option>
          <option value="earliest">Earliest</option>
          <option value="today">Today</option>
        </select>

        <button
          onClick={() => {
            setSearch('')
            setDateFilter('')
            setLocationFilter('')
            setSourceFilter('')
            setSortType('latest')
          }}
          className="px-4 py-2 border rounded"
        >
          Reset
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No bookings found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-left text-sm">
              <tr>
                <th className="p-3">Client</th>
                <th className="p-3">Service</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Location</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Source</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filtered.map((booking) => (
                <tr key={booking.id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">{booking.client_name}</p>
                    <p className="text-xs text-gray-500">{booking.phone || '-'}</p>
                  </td>
                  <td className="p-3">{booking.service || '-'}</td>
                  <td className="p-3">{booking.appointment_date}</td>
                  <td className="p-3">{booking.appointment_time}</td>
                  <td className="p-3">{booking.location}</td>
                  <td className="p-3">EUR {(booking.total_amount ?? 0).toFixed(2)}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100">
                      {booking.source || '-'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-600'
                          : booking.status === 'arrived'
                            ? 'bg-green-100 text-green-600'
                            : booking.status === 'canceled'
                              ? 'bg-red-100 text-red-600'
                              : booking.status === 'completed'
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
