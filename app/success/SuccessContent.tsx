'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function SuccessContent() {
  const router = useRouter()
  const params = useSearchParams()
  const totalAmount = Number(params.get('total') || 0)
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: totalAmount,
        currency: 'EUR',
      })
    }

    hasTracked.current = true
  }, [totalAmount])

  return (
    <div className="py-20 text-center">
      <h1 className="mb-4 text-2xl font-semibold">Order Placed Successfully</h1>

      <p className="mb-6 text-gray-500">We will contact you shortly.</p>

      <button
        onClick={() => router.push('/')}
        className="rounded-xl bg-[#C6A96B] px-6 py-3 text-white"
      >
        Back to Home
      </button>
    </div>
  )
}
