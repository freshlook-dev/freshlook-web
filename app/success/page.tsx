'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'


export default function SuccessPage() {
  const router = useRouter()
  const params = useSearchParams()

  const totalAmount = Number(params.get('total') || 0)

 const hasTracked = useRef(false)

useEffect(() => {
  if (hasTracked.current) return

  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('track', 'Purchase', {
      value: totalAmount,
      currency: 'EUR'
    })
  }

  hasTracked.current = true
}, [totalAmount])

  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-semibold mb-4">
        Order Placed Successfully 🎉
      </h1>

      <p className="text-gray-500 mb-6">
        We will contact you shortly.
      </p>

      <button
        onClick={() => router.push('/')}
        className="bg-[#C6A96B] text-white px-6 py-3 rounded-xl"
      >
        Back to Home
      </button>
    </div>
  )
}