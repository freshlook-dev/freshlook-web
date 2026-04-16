'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Service = {
  id: string
  name: string
  subtitle: string
  description: string
  price: number
  duration: number
  image_url: string | null
  is_on_sale: boolean
  sale_price: number | null
  is_active: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setServices(data)
      }

      setLoading(false)
    }

    fetchServices()
  }, [])

  const handleBook = (id: string) => {
    router.push(`/book?service=${id}`)
  }

  const getDiscount = (price: number, sale: number) => {
    return Math.round(((price - sale) / price) * 100)
  }

  return (
    <main className="w-full px-4 py-10 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-playfair mb-3">
          Our Services
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Discover our premium aesthetic treatments tailored for you
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500">Loading services...</p>
      )}

      {/* GRID */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">

          {services.map((service) => {
            const isExpanded = expanded === service.id

            return (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden relative"
              >

                {/* SALE BADGE */}
                {service.is_on_sale && service.sale_price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
                    -{getDiscount(service.price, service.sale_price)}%
                  </div>
                )}

                {/* IMAGE */}
                <div
                  className="h-36 sm:h-44 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${service.image_url || '/assets/product1.jpg'})`,
                  }}
                />

                {/* CONTENT */}
                <div className="p-3 sm:p-4">

                  {/* TITLE */}
                  <h3 className="font-semibold text-sm sm:text-base">
                    {service.name}
                  </h3>

                  {/* SUBTITLE */}
                  <p className="text-gray-400 text-xs">
                    {service.subtitle}
                  </p>

                  {/* PRICE */}
                  <div className="mt-1 text-sm">
                    {service.is_on_sale && service.sale_price ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">
                          €{service.price}
                        </span>
                        <span className="text-[#C6A96B] font-semibold">
                          €{service.sale_price}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-700">
                        €{service.price}
                      </span>
                    )}
                  </div>

                  {/* EXPAND BUTTON */}
                  <button
                    onClick={() =>
                      setExpanded(isExpanded ? null : service.id)
                    }
                    className="mt-2 text-xs text-[#C6A96B]"
                  >
                    {isExpanded ? 'Hide details' : 'View details'}
                  </button>

                  {/* DESCRIPTION */}
                  {isExpanded && (
                    <p className="mt-2 text-xs text-gray-500">
                      {service.description}
                    </p>
                  )}

                  {/* BOOK BUTTON */}
                  <button
                    onClick={() => handleBook(service.id)}
                    className="mt-3 w-full bg-[#C6A96B] text-white py-2 rounded-xl text-sm"
                  >
                    Book Now
                  </button>

                </div>
              </motion.div>
            )
          })}

        </div>
      )}

    </main>
  )
}