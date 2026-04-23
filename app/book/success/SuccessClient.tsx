'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function BookingSuccessPage() {
  const params = useSearchParams()
  const router = useRouter()

  const service = params.get('service') || '-'
  const date = params.get('date') || '-'
  const time = params.get('time') || '-'
  const location = params.get('location') || '-'
  const name = params.get('name') || ''

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Schedule', {
        content_name: 'Appointment Booking',
        value: 1,
        currency: 'EUR',
      })
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7EEDF] px-4">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#e5dccb] bg-white p-8 text-center shadow-xl"
      >
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-green-500/10 blur-3xl" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl font-semibold text-green-600 shadow-sm"
        >
          OK
        </motion.div>

        <h1 className="mb-2 text-2xl font-semibold text-[#C6A96B]">
          Booking Confirmed
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          Thank you <span className="font-medium">{name}</span>, your appointment has been successfully booked.
        </p>

        <div className="mb-6 space-y-3 rounded-2xl border border-[#e5dccb] bg-[#F7EEDF] p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Service</span>
            <span className="font-medium">{service}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="font-medium">{date}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Time</span>
            <span className="font-medium">{time}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Location</span>
            <span className="font-medium">{location}</span>
          </div>
        </div>

        <p className="mb-6 text-xs text-gray-400">
          A confirmation email has been sent if an email address was provided.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-xl bg-[#C6A96B] py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Back to Home
          </button>

          <button
            onClick={() => router.push('/book')}
            className="w-full rounded-xl border border-[#e5dccb] py-3 text-gray-700 transition hover:bg-white"
          >
            Book Another Appointment
          </button>
        </div>
      </motion.div>
    </div>
  )
}
