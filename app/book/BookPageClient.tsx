'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Suspense } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Service = {
  id: string
  name: string
  price: number
  duration: number
}

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedServiceId = searchParams.get('service')

  const [step, setStep] = useState(1)

  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const [location, setLocation] = useState<string>('')

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [bookedTimes, setBookedTimes] = useState<string[]>([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const [loading, setLoading] = useState(false)

  const timeSlots = [
    '09:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00'
  ]

  // FETCH SERVICES
  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)

      if (data) {
        setServices(data)

        if (selectedServiceId) {
          const found = data.find(s => s.id === selectedServiceId)
          if (found) {
            setSelectedService(found)
            setStep(2)
          }
        }
      }
    }

    fetchServices()
  }, [selectedServiceId])

  // ✅ FETCH BOOKED TIMES (FIXED)
  useEffect(() => {
    if (!date || !location) return

    const fetchBooked = async () => {
      const formattedDate = new Date(date)
        .toISOString()
        .split('T')[0]

      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', formattedDate)
        .eq('location', location)
        .eq('status', 'upcoming') // ✅ ONLY ACTIVE BOOKINGS

      console.log('DATE:', formattedDate)
      console.log('LOCATION:', location)
      console.log('FETCH RESULT:', data)

      if (!error && data) {
        const formatted = data.map(a =>
          a.appointment_time.substring(0, 5)
        )

        console.log('FORMATTED TIMES:', formatted)

        setBookedTimes(formatted)
      }
    }

    fetchBooked()
  }, [date, location])

  const handleBooking = async () => {
    if (!selectedService || !location || !date || !time || !name || !phone) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('appointments').insert([
      {
        service: selectedService.name,
        location,
        appointment_date: new Date(date).toISOString().split('T')[0],
        appointment_time: time,
        client_name: name,
        phone: phone,
        email: email || null,
        status: 'upcoming',
        archived: false,
        source: 'website',
      },
    ])

    setLoading(false)

    if (!error) {
      router.push('/booking-success')
    } else {
      alert('Error booking')
    }
  }

  return (
    <main className="w-full px-4 py-10 max-w-3xl mx-auto">

      {/* STEP INDICATOR */}
      <div className="flex justify-between mb-8 text-sm">
        <span className={step === 1 ? 'font-bold' : ''}>Service</span>
        <span className={step === 2 ? 'font-bold' : ''}>Location</span>
        <span className={step === 3 ? 'font-bold' : ''}>Date & Time</span>
        <span className={step === 4 ? 'font-bold' : ''}>Info</span>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          <h2 className="mb-4 font-semibold">Select Service</h2>
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => {
                  setSelectedService(service)
                  setStep(2)
                }}
                className="p-4 border rounded-xl cursor-pointer"
              >
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-gray-500">
                  €{service.price} • {service.duration} min
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          <h2 className="mb-4 font-semibold">Select Location</h2>
          <div className="grid grid-cols-2 gap-4">
            {['Prishtinë', 'Fushë Kosovë'].map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocation(loc)
                  setStep(3)
                }}
                className={`p-4 border rounded-xl ${
                  location === loc ? 'border-[#C6A96B]' : ''
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div>
          <h2 className="mb-4 font-semibold">Select Date & Time</h2>

          <input
            type="date"
            className="w-full border p-3 rounded-xl mb-4"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              setTime('')
            }}
          />

          {date && (
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((slot) => {
                const isBooked = bookedTimes.includes(slot)

                return (
                  <button
                    key={slot}
                    disabled={isBooked}
                    onClick={() => setTime(slot)}
                    className={`p-2 rounded-xl border text-sm ${
                      isBooked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : time === slot
                        ? 'border-[#C6A96B]'
                        : 'border-gray-200'
                    }`}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          )}

          <button
            onClick={() => setStep(4)}
            disabled={!time}
            className="mt-6 w-full bg-[#C6A96B] text-white py-3 rounded-xl"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div>
          <h2 className="mb-4 font-semibold">Your Info</h2>

          <input
            placeholder="Full Name"
            className="w-full border p-3 rounded-xl mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Phone Number"
            className="w-full border p-3 rounded-xl mb-4"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            placeholder="Email (optional)"
            type="email"
            className="w-full border p-3 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <p className="text-xs text-gray-500 mt-1 mb-4">
            If you want to receive a confirmation via email, please enter your email address.
          </p>

          <button
            onClick={handleBooking}
            disabled={loading}
            className="w-full bg-[#C6A96B] text-white py-3 rounded-xl"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      )}

    </main>
  )
}