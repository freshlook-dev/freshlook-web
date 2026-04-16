'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export default function BookingSuccessPage() {
  const params = useSearchParams()
  const router = useRouter()

  const service = params.get('service')
  const date = params.get('date')
  const time = params.get('time')
  const location = params.get('location')
  const name = params.get('name')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-neutral-100 to-neutral-200 px-4">

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-3xl shadow-xl p-8 space-y-6 text-center">

        {/* SUCCESS ICON */}
        <div className="text-5xl">✅</div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-[#C6A96B]">
          Booking Confirmed
        </h1>

        {/* DESCRIPTION */}
        <p className="text-gray-600 text-sm">
          Thank you {name || ''}, your appointment has been successfully booked.
        </p>

        {/* DETAILS */}
        <div className="bg-neutral-50 rounded-xl p-4 text-sm space-y-2 border">
          <p><b>Service:</b> {service}</p>
          <p><b>Date:</b> {date}</p>
          <p><b>Time:</b> {time}</p>
          <p><b>Location:</b> {location}</p>
        </div>

        {/* INFO */}
        <p className="text-xs text-gray-400">
          A confirmation email has been sent (if provided).
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col gap-3 pt-2">

          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#C6A96B] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Back to Home
          </button>

          <button
            onClick={() => router.push('/book')}
            className="w-full border border-gray-300 py-3 rounded-xl"
          >
            Book Another Appointment
          </button>

        </div>

      </div>
    </div>
  )
}