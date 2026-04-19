'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function ServicePage() {
  const { id } = useParams()
  const router = useRouter()

  const [service, setService] = useState<any>(null)

  useEffect(() => {
    const fetchService = async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()

      setService(data)
    }

    if (id) fetchService()
  }, [id])

  if (!service) return <div className="p-10">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="grid md:grid-cols-2 gap-10">

        <div
          className="aspect-[4/3] bg-cover bg-center rounded-2xl"
          style={{ backgroundImage: `url(${service.image_url})` }}
        />

        <div>
          <h1 className="text-2xl font-semibold mb-4">{service.name}</h1>

          <p className="text-gray-500 mb-6">
            {service.description || 'No description available.'}
          </p>

          {service.is_on_sale && service.sale_price ? (
            <div className="flex gap-3 items-center mb-6">
              <span className="text-xl text-[#C6A96B] font-bold">
                €{service.sale_price}
              </span>
              <span className="line-through text-gray-400">
                €{service.price}
              </span>
            </div>
          ) : (
            <div className="text-xl text-[#C6A96B] font-bold mb-6">
              €{service.price}
            </div>
          )}

          <button
            onClick={() => router.push('/book')}
            className="bg-[#C6A96B] text-white px-6 py-3 rounded-full"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}