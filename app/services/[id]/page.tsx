'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Service = {
  id: string
  name: string
  price: number
  sale_price: number | null
  is_on_sale: boolean
  image_url: string
  description: string | null
  duration: string | null
  before_image: string | null
  after_image: string | null
}

export default function ServicePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [service, setService] = useState<Service | null>(null)
  const [related, setRelated] = useState<Service[]>([])

  useEffect(() => {
    const fetchService = async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('id', params.id)
        .single()

      setService(data as Service | null)

      if (!data) {
        return
      }

      const { data: relatedData } = await supabase
        .from('services')
        .select('*')
        .neq('id', data.id)
        .limit(4)

      setRelated((relatedData as Service[]) || [])
    }

    if (params.id) {
      void fetchService()
    }
  }, [params.id])

  if (!service) {
    return <div className="p-10">Loading...</div>
  }

  const isSale = service.is_on_sale && service.sale_price
  const discount = isSale
    ? Math.round(((service.price - service.sale_price!) / service.price) * 100)
    : 0
  const savings = isSale ? (service.price - service.sale_price!).toFixed(2) : '0.00'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-24">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-gray-500"
      >
        &lt;- Back
      </button>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative">
          {isSale && (
            <div className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
              -{discount}%
            </div>
          )}

          <div
            className="aspect-[4/3] rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: `url(${service.image_url})` }}
          />
        </div>

        <div>
          <h1 className="mb-4 text-2xl font-semibold">{service.name}</h1>

          {isSale ? (
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-[#C6A96B]">
                  EUR {service.sale_price}
                </span>
                <span className="text-gray-400 line-through">
                  EUR {service.price}
                </span>
              </div>

              <p className="mt-1 text-sm text-green-600">You save EUR {savings}</p>
            </div>
          ) : (
            <div className="mb-4 text-2xl font-bold text-[#C6A96B]">
              EUR {service.price}
            </div>
          )}

          <div className="mb-4 text-sm text-gray-500">
            Duration: {service.duration || '30-60 min'}
          </div>

          <ul className="mb-6 space-y-2 text-gray-600">
            {(service.description || '')
              .split('.')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, index) => (
                <li key={index}>- {line}</li>
              ))}
          </ul>

          <button
            onClick={() => router.push(`/book?service=${service.id}`)}
            className="w-full rounded-full bg-[#C6A96B] px-6 py-3 text-white"
          >
            Book This Treatment
          </button>
        </div>
      </div>

      {service.before_image && service.after_image && (
        <div className="mt-12 grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs text-gray-400">Before</p>
            <div
              className="aspect-[4/3] rounded-xl bg-cover bg-center"
              style={{ backgroundImage: `url(${service.before_image})` }}
            />
          </div>

          <div>
            <p className="mb-1 text-xs text-gray-400">After</p>
            <div
              className="aspect-[4/3] rounded-xl bg-cover bg-center"
              style={{ backgroundImage: `url(${service.after_image})` }}
            />
          </div>
        </div>
      )}

      <div className="mt-16">
        <h3 className="mb-6 text-xl font-semibold">You may also like</h3>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {related.map((relatedService) => (
            <div
              key={relatedService.id}
              onClick={() => router.push(`/services/${relatedService.id}`)}
              className="cursor-pointer"
            >
              <div
                className="aspect-[4/3] rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${relatedService.image_url})` }}
              />

              <p className="mt-2 text-sm">{relatedService.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-between border-t bg-white p-4 md:hidden">
        <div className="flex items-center gap-2">
          {isSale ? (
            <>
              <span className="font-semibold text-[#C6A96B]">
                EUR {service.sale_price}
              </span>
              <span className="text-xs text-gray-400 line-through">
                EUR {service.price}
              </span>
            </>
          ) : (
            <span className="font-semibold text-[#C6A96B]">
              EUR {service.price}
            </span>
          )}
        </div>

        <button
          onClick={() => router.push(`/book?service=${service.id}`)}
          className="rounded-full bg-[#C6A96B] px-6 py-2 text-white"
        >
          Book
        </button>
      </div>
    </div>
  )
}
