'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

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

  useEffect(() => {
    if (!date || !location) return

    const fetchBooked = async () => {
      const formattedDate = new Date(date).toISOString().split('T')[0]

      const { data } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', formattedDate)
        .eq('location', location)
        .eq('status', 'upcoming')

      if (data) {
        const formatted = data.map(a =>
          a.appointment_time.substring(0, 5)
        )

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

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const user = session?.user

    const bookingPayload = {
      service: selectedService.name,
      location,
      appointment_date: new Date(date).toISOString().split('T')[0],
      appointment_time: time,
      client_name: name,
      phone: phone,
      email: email || null,
      user_id: user?.id || null,
      created_by: user?.id || null,
      status: 'upcoming',
      archived: false,
      source: 'website',
    }

    const { error } = await supabase.from('appointments').insert([bookingPayload])

    if (error) {
      setLoading(false)
      alert('Error booking')
      return
    }

    // ✅ SEND EMAIL CONFIRMATION (ONLY IF EMAIL EXISTS)
    if (email) {
      try {
        await fetch('/api/send-booking-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name,
            service: selectedService.name,
            date: bookingPayload.appointment_date,
            time,
            location,
          }),
        })
      } catch (err) {
        console.error('Email send failed:', err)
      }
    }

    setLoading(false)

    router.push('/book/success')
  }

  const steps = ['Service', 'Location', 'Date', 'Info']

  return (
    <main className="w-full px-4 py-10 max-w-3xl mx-auto bg-[#F7EEDF] min-h-screen">

      <div className="mb-10">
        <div className="flex justify-between items-center relative">

          <div className="absolute top-1/2 left-0 w-full h-1 bg-[#e5dccb] -translate-y-1/2 rounded-full" />

          <motion.div
            className="absolute top-1/2 left-0 h-1 bg-[#C6A96B] -translate-y-1/2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((step - 1) / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />

          {steps.map((label, i) => {
            const s = i + 1
            const active = step >= s

            return (
              <div key={i} className="z-10 flex flex-col items-center text-center w-full">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: active ? 1 : 0.9 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                    ${active ? 'bg-[#C6A96B] text-white shadow-lg' : 'bg-white border border-[#e5dccb] text-gray-400'}
                  `}
                >
                  {s}
                </motion.div>

                <span className={`text-xs mt-2 ${active ? 'text-black font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {step > 1 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mb-6 text-sm text-gray-600 hover:text-black"
        >
          ← Back
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >

          {step === 1 && (
            <div>
              <h2 className="mb-4 font-semibold">Select Service</h2>
              <div className="grid grid-cols-2 gap-4">
                {services.map((service) => (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service)
                      setStep(2)
                    }}
                    className="p-5 rounded-2xl cursor-pointer bg-[#F7EEDF] border border-[#e5dccb] shadow-sm hover:shadow-md transition"
                  >
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-gray-500">
                      €{service.price} • {service.duration} min
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-4 font-semibold">Select Location</h2>
              <div className="grid grid-cols-2 gap-4">
                {['Prishtinë', 'Fushë Kosovë'].map((loc) => (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    key={loc}
                    onClick={() => {
                      setLocation(loc)
                      setStep(3)
                    }}
                    className={`p-5 rounded-2xl border ${
                      location === loc
                        ? 'border-[#C6A96B] bg-white'
                        : 'border-[#e5dccb] bg-[#F7EEDF]'
                    }`}
                  >
                    {loc}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-4 font-semibold">Select Date & Time</h2>

              <DatePicker
                selected={date ? new Date(date) : null}
                onChange={(dateObj: Date | null) => {
                  if (!dateObj) return
                  const formatted = dateObj.toISOString().split('T')[0]
                  setDate(formatted)
                  setTime('')
                }}
                minDate={new Date()}
                filterDate={(dateObj) => dateObj.getDay() !== 0}
                placeholderText="Select a date"
                className="w-full border border-[#e5dccb] p-3 rounded-xl mb-4 bg-white text-black"
              />

              {date && (
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((slot) => {
                    const isBooked = bookedTimes.includes(slot)

                    return (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setTime(slot)}
                        className={`p-2 rounded-xl border text-sm ${
                          isBooked
                            ? 'bg-gray-100 text-gray-400'
                            : time === slot
                            ? 'border-[#C6A96B] bg-white'
                            : 'border-[#e5dccb] bg-[#F7EEDF]'
                        }`}
                      >
                        {slot}
                      </motion.button>
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

          {step === 4 && (
            <div>
              <h2 className="mb-4 font-semibold">Your Info</h2>

              <input
                placeholder="Full Name"
                className="w-full border border-[#e5dccb] p-3 rounded-xl mb-4 bg-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                placeholder="Phone Number"
                className="w-full border border-[#e5dccb] p-3 rounded-xl mb-4 bg-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <input
                placeholder="Email (optional)"
                type="email"
                className="w-full border border-[#e5dccb] p-3 rounded-xl bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* ✅ PROFESSIONAL HELPER TEXT */}
              <p className="text-sm text-gray-500 mt-2">
                Enter your email address if you would like to receive a booking confirmation.
              </p>

              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-[#C6A96B] text-white py-3 rounded-xl mt-4"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </main>
  )
}