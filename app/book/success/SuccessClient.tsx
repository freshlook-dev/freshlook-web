'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function BookingSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();

  const service = params.get('service') || '-';
  const date = params.get('date') || '-';
  const time = params.get('time') || '-';
  const location = params.get('location') || '-';
  const name = params.get('name') || '';

  // ✅ Meta Pixel Schedule Event (FIXED)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'Schedule', {
        content_name: 'Appointment Booking',
        value: 1,
        currency: 'EUR'
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7EEDF] px-4">

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#e5dccb] p-8 text-center relative overflow-hidden"
      >

        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl mb-4 shadow-sm"
        >
          ✓
        </motion.div>

        <h1 className="text-2xl font-semibold text-[#C6A96B] mb-2">
          Booking Confirmed
        </h1>

        <p className="text-gray-600 text-sm mb-6">
          Thank you <span className="font-medium">{name}</span>, your appointment has been successfully booked.
        </p>

        <div className="bg-[#F7EEDF] border border-[#e5dccb] rounded-2xl p-5 text-sm space-y-3 mb-6">

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

        <p className="text-xs text-gray-400 mb-6">
          A confirmation email has been sent if an email address was provided.
        </p>

        <div className="flex flex-col gap-3">

          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#C6A96B] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-sm"
          >
            Back to Home
          </button>

          <button
            onClick={() => router.push('/book')}
            className="w-full border border-[#e5dccb] py-3 rounded-xl text-gray-700 hover:bg-white transition"
          >
            Book Another Appointment
          </button>

        </div>

      </motion.div>
    </div>
  );
}