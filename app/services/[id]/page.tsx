'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function ServicePage() {
  const { id } = useParams()
  const router = useRouter()

  const [service, setService] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])

  useEffect(() => {
    const fetchService = async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()

      setService(data)

      if (data) {
        const { data: rel } = await supabase
          .from('services')
          .select('*')
          .neq('id', data.id)
          .limit(4)

        setRelated(rel || [])
      }
    }

    if (id) fetchService()
  }, [id])

  if (!service) return <div className="p-10">Loading...</div>

  const isSale = service.is_on_sale && service.sale_price
  const discount = isSale
    ? Math.round(((service.price - service.sale_price) / service.price) * 100)
    : 0

  const savings = isSale
    ? (service.price - service.sale_price).toFixed(2)
    : 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 pb-24">

      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-gray-500"
      >
        ← Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">

        {/* IMAGE */}
        <div className="relative">
          {isSale && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
              -{discount}%
            </div>
          )}

          <div
            className="aspect-[4/3] bg-cover bg-center rounded-2xl"
            style={{ backgroundImage: `url(${service.image_url})` }}
          />
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-2xl font-semibold mb-4">
            {service.name}
          </h1>

          {/* PRICE */}
          {isSale ? (
            <div className="mb-4">
              <div className="flex gap-3 items-center">
                <span className="text-2xl text-[#C6A96B] font-bold">
                  €{service.sale_price}
                </span>
                <span className="line-through text-gray-400">
                  €{service.price}
                </span>
              </div>

              <p className="text-sm text-green-600 mt-1">
                You save €{savings}
              </p>
            </div>
          ) : (
            <div className="text-2xl text-[#C6A96B] font-bold mb-4">
              €{service.price}
            </div>
          )}

          {/* DURATION */}
          <div className="text-sm text-gray-500 mb-4">
            ⏱ Duration: {service.duration || '30-60 min'}
          </div>

          {/* DESCRIPTION */}
          <ul className="space-y-2 text-gray-600 mb-6">
            {(service.description || '')
              .split('.')
              .filter(Boolean)
              .map((line: string, i: number) => (
                <li key={i}>• {line}</li>
              ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => router.push(`/book?service=${service.id}`)}
            className="bg-[#C6A96B] text-white px-6 py-3 rounded-full w-full"
          >
            Book This Treatment
          </button>
        </div>
      </div>

      {/* BEFORE / AFTER */}
      {service.before_image && service.after_image && (
        <div className="mt-12 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Before</p>
            <div
              className="aspect-[4/3] bg-cover bg-center rounded-xl"
              style={{ backgroundImage: `url(${service.before_image})` }}
            />
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">After</p>
            <div
              className="aspect-[4/3] bg-cover bg-center rounded-xl"
              style={{ backgroundImage: `url(${service.after_image})` }}
            />
          </div>
        </div>
      )}

      {/* RELATED */}
      <div className="mt-16">
        <h3 className="text-xl font-semibold mb-6">
          You may also like
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {related.map((r) => (
            <div
              key={r.id}
              onClick={() => router.push(`/services/${r.id}`)}
              className="cursor-pointer"
            >
              <div
                className="aspect-[4/3] bg-cover bg-center rounded-xl"
                style={{ backgroundImage: `url(${r.image_url})` }}
              />

              <p className="text-sm mt-2">{r.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STICKY MOBILE BOOK */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-between items-center md:hidden z-50">

        <div className="flex items-center gap-2">
          {isSale ? (
            <>
              <span className="font-semibold text-[#C6A96B]">
                €{service.sale_price}
              </span>
              <span className="text-xs text-gray-400 line-through">
                €{service.price}
              </span>
            </>
          ) : (
            <span className="font-semibold text-[#C6A96B]">
              €{service.price}
            </span>
          )}
        </div>

        <button
          onClick={() => router.push(`/book?service=${service.id}`)}
          className="bg-[#C6A96B] text-white px-6 py-2 rounded-full"
        >
          Book
        </button>
      </div>
    </div>
  )
}