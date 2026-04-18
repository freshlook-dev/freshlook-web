'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Booking = {
  id: string
  client_name: string
  email: string
  phone: string
  service: string
  appointment_date: string
  appointment_time: string
  location: string
  status: string
  total_amount: number | null
  source: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filtered, setFiltered] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sortType, setSortType] = useState('latest')

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')

    if (!error && data) {
      setBookings(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchBookings()

    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => fetchBookings()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    let data = [...bookings]

    if (search) {
      data = data.filter(
        (b) =>
          b.client_name?.toLowerCase().includes(search.toLowerCase()) ||
          b.email?.toLowerCase().includes(search.toLowerCase()) ||
          b.phone?.toLowerCase().includes(search.toLowerCase()) ||
          b.service?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (dateFilter) {
      data = data.filter((b) => b.appointment_date === dateFilter)
    }

    if (locationFilter) {
      data = data.filter((b) => b.location === locationFilter)
    }

    if (sourceFilter) {
      data = data.filter((b) => b.source === sourceFilter)
    }

    if (sortType === 'latest') {
      data.sort(
        (a, b) =>
          new Date(b.appointment_date).getTime() -
          new Date(a.appointment_date).getTime()
      )
    }

    if (sortType === 'earliest') {
      data.sort(
        (a, b) =>
          new Date(a.appointment_date).getTime() -
          new Date(b.appointment_date).getTime()
      )
    }

    if (sortType === 'today') {
      const today = new Date().toISOString().split('T')[0]
      data = data.filter((b) => b.appointment_date === today)
    }

    setFiltered(data)
  }, [search, dateFilter, locationFilter, sourceFilter, sortType, bookings])

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
          <option value="Prishtinë">Prishtinë</option>
          <option value="Fushë Kosovë">Fushë Kosovë</option>
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
          onChange={(e) => setSortType(e.target.value)}
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
              {filtered.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">{b.client_name}</p>
                    <p className="text-xs text-gray-500">{b.phone}</p>
                  </td>

                  <td className="p-3">{b.service}</td>
                  <td className="p-3">{b.appointment_date}</td>
                  <td className="p-3">{b.appointment_time}</td>
                  <td className="p-3">{b.location}</td>

                  <td className="p-3">
                    €{(b.total_amount ?? 0).toFixed(2)}
                  </td>

                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100">
                      {b.source}
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        b.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-600'
                          : b.status === 'arrived'
                          ? 'bg-green-100 text-green-600'
                          : b.status === 'canceled'
                          ? 'bg-red-100 text-red-600'
                          : b.status === 'completed'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {b.status}
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