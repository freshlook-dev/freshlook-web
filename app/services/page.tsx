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
    <main className="w-full bg-[#F7EEDF] py-12">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-playfair mb-4">
            Our Services
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Discover our premium aesthetic treatments tailored for you
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-center text-gray-500">Loading services...</p>
        )}

        {/* GRID */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">

            {services.map((service, i) => {
              const isExpanded = expanded === service.id

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-[#F7EEDF] border border-[#e5dccb] rounded-3xl shadow-md overflow-hidden relative group flex flex-col"
                >

                  {/* SALE BADGE */}
                  {service.is_on_sale && service.sale_price && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
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
                  <div className="p-4 flex flex-col flex-1">

                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        {service.name}
                      </h3>

                      <p className="text-gray-500 text-xs mt-1">
                        {service.subtitle}
                      </p>

                      {/* PRICE */}
                      <div className="mt-2 text-sm">
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
                          <span className="text-gray-700 font-medium">
                            €{service.price}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-400 mt-1">
                        {service.duration} min
                      </p>

                      <button
                        onClick={() =>
                          setExpanded(isExpanded ? null : service.id)
                        }
                        className="mt-2 text-xs text-[#C6A96B]"
                      >
                        {isExpanded ? 'Hide details' : 'View details'}
                      </button>

                      {isExpanded && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-2 text-xs text-gray-600 leading-relaxed"
                        >
                          {service.description}
                        </motion.p>
                      )}
                    </div>

                    {/* CTA BUTTON */}
                    <button
                      onClick={() => handleBook(service.id)}
                      className="mt-4 w-full bg-[#C6A96B] hover:bg-[#b8965a] active:scale-95 transition text-white py-3 rounded-full text-sm shadow-md"
                    >
                      Book Now
                    </button>

                  </div>
                </motion.div>
              )
            })}

          </div>
        )}

      </div>
    </main>
  )
}