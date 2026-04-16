'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

type Service = {
  id: string
  name: string
  subtitle: string
  price: number
  is_on_sale: boolean
  sale_price: number | null
  image_url: string
}

type Product = {
  id: string
  name: string
  price: number
  is_on_sale: boolean
  sale_price: number | null
  image_url: string
}

export default function HomePage() {
  const router = useRouter()

  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: s } = await supabase.from('services').select('*').limit(4)
    const { data: p } = await supabase.from('products').select('*').limit(4)

    if (s) setServices(s)
    if (p) setProducts(p)
  }

  return (
    <main className="bg-white">

      {/* ================= HERO ================= */}
      <section className="relative h-[85vh] flex items-center justify-center text-center overflow-hidden">

        {/* BACKGROUND IMAGE */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url('/assets/product1.jpg')`,
          }}
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

        {/* CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-white px-4 max-w-2xl"
        >
          <h1 className="text-4xl sm:text-5xl font-playfair mb-4 leading-tight">
            Elevate Your Beauty Experience
          </h1>

          <p className="text-sm sm:text-base text-gray-200 mb-6">
            Premium aesthetic treatments and skincare tailored to perfection
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/book')}
              className="bg-[#C6A96B] px-6 py-3 rounded-xl text-white text-sm"
            >
              Book Appointment
            </button>

            <button
              onClick={() => router.push('/services')}
              className="border border-white px-6 py-3 rounded-xl text-sm"
            >
              Explore Services
            </button>
          </div>
        </motion.div>
      </section>


      {/* ================= SERVICES ================= */}
      <section className="max-w-7xl mx-auto px-4 py-20">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-playfair mb-2">
            Signature Treatments
          </h2>
          <p className="text-gray-500 text-sm">
            Crafted for natural, refined results
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {services.map((s, i) => {
            const price =
              s.is_on_sale && s.sale_price ? s.sale_price : s.price

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <div
                  className="h-36 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${s.image_url || '/assets/product1.jpg'})`,
                  }}
                />

                <div className="p-4">
                  <h3 className="font-semibold text-sm">{s.name}</h3>
                  <p className="text-xs text-gray-500">{s.subtitle}</p>

                  <div className="mt-2">
                    {s.is_on_sale && s.sale_price ? (
                      <>
                        <span className="text-[#C6A96B] font-semibold">
                          €{s.sale_price}
                        </span>
                        <span className="text-xs line-through text-gray-400 ml-2">
                          €{s.price}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">€{price}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>


      {/* ================= LUXURY STRIP ================= */}
      <section className="bg-[#C6A96B] text-white text-center py-14">
        <h2 className="text-2xl font-playfair mb-2">
          Luxury. Precision. Confidence.
        </h2>
        <p className="text-sm opacity-90">
          Your beauty deserves the highest standard of care
        </p>
      </section>


      {/* ================= PRODUCTS ================= */}
      <section className="max-w-7xl mx-auto px-4 py-20">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-playfair mb-2">
            Skincare Essentials
          </h2>
          <p className="text-gray-500 text-sm">
            Maintain your glow every day
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {products.map((p, i) => {
            const price =
              p.is_on_sale && p.sale_price ? p.sale_price : p.price

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <div
                  className="h-36 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${p.image_url || '/assets/product1.jpg'})`,
                  }}
                />

                <div className="p-4">
                  <h3 className="font-semibold text-sm">{p.name}</h3>

                  <div className="mt-2 mb-3">
                    {p.is_on_sale && p.sale_price ? (
                      <>
                        <span className="text-[#C6A96B] font-semibold">
                          €{p.sale_price}
                        </span>
                        <span className="text-xs line-through text-gray-400 ml-2">
                          €{p.price}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">€{price}</span>
                    )}
                  </div>

                  <button
                    onClick={() => router.push('/shop')}
                    className="w-full bg-[#C6A96B] text-white py-2 rounded-xl text-xs"
                  >
                    Shop Now
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>


      {/* ================= CTA ================= */}
      <section className="text-center py-20 px-4">
        <h2 className="text-3xl font-playfair mb-4">
          Ready to Transform Your Look?
        </h2>

        <button
          onClick={() => router.push('/book')}
          className="bg-[#C6A96B] text-white px-8 py-3 rounded-xl"
        >
          Book Now
        </button>
      </section>

    </main>
  )
}