'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
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

type Slide = {
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  image_desktop: string
  image_mobile: string
}

// ✅ COUNTER COMPONENT
function Counter({ value }: { value: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.floor(latest))
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(count, value, { duration: 2 })

    const unsubscribe = rounded.on('change', (v) => {
      setDisplay(v)
    })

    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [value])

  return <span>{display}+</span>
}

export default function HomePage() {
  const router = useRouter()

  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    fetchData()
    fetchHero()
  }, [])

  useEffect(() => {
    if (!slides.length) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides])

  const fetchData = async () => {
    const { data: s } = await supabase.from('services').select('*').limit(4)
    const { data: p } = await supabase.from('products').select('*').limit(4)

    if (s) setServices(s)
    if (p) setProducts(p)
  }

  const fetchHero = async () => {
    const { data } = await supabase
      .from('content')
      .select('*')
      .eq('key', 'hero')
      .single()

    if (data?.value?.slides) {
      setSlides(data.value.slides)
    }
  }

  const currentSlide = slides[current]

  return (
    <main className="bg-white">

      {/* HERO */}
      <section className="relative h-[85vh] flex items-center justify-center text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${currentSlide?.image_desktop || '/assets/product1.jpg'})`,
          }}
        />
        <div className="absolute inset-0 bg-black/40" />

        <motion.div
          key={current}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-white max-w-2xl px-4"
        >
          <h1 className="text-4xl sm:text-5xl font-playfair mb-4">
            {currentSlide?.title || 'Elevate Your Beauty Experience'}
          </h1>

          <p className="mb-6 text-gray-200">
            {currentSlide?.subtitle || 'Premium treatments tailored to perfection'}
          </p>

          <button
            onClick={() => router.push(currentSlide?.cta_link || '/book')}
            className="bg-[#C6A96B] px-6 py-3 rounded-xl"
          >
            {currentSlide?.cta_text || 'Book Now'}
          </button>
        </motion.div>
      </section>

      {/* SERVICES */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-playfair text-center mb-12">
          Signature Treatments
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden relative"
            >
              {s.is_on_sale && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  SALE
                </div>
              )}

              <div
                className="h-36 bg-cover bg-center"
                style={{ backgroundImage: `url(${s.image_url})` }}
              />

              <div className="p-4">
                <h3 className="text-sm font-semibold">{s.name}</h3>

                <div className="mt-2">
                  {s.is_on_sale && s.sale_price ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[#C6A96B] font-semibold">
                        €{s.sale_price}
                      </span>
                      <span className="text-red-500 line-through text-sm">
                        €{s.price}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold">€{s.price}</span>
                  )}
                </div>

                <button
                  onClick={() => router.push('/book')}
                  className="mt-3 w-full bg-[#C6A96B] text-white py-2 rounded-xl text-xs"
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST NUMBERS */}
      <section className="bg-[#f9f7f3] py-16 text-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-5xl mx-auto">

          {[
            { label: 'Happy Clients', value: 1200 },
            { label: 'Treatments Done', value: 3500 },
            { label: 'Years Experience', value: 8 },
            { label: '5★ Reviews', value: 950 },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <h3 className="text-3xl font-bold text-[#C6A96B]">
                <Counter value={item.value} />
              </h3>

              <p className="text-sm text-gray-600 mt-2">{item.label}</p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-playfair text-center mb-12">
          Skincare Essentials
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-md overflow-hidden relative">

              {p.is_on_sale && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  SALE
                </div>
              )}

              <div
                className="h-36 bg-cover bg-center"
                style={{ backgroundImage: `url(${p.image_url})` }}
              />

              <div className="p-4">
                <h3 className="text-sm font-semibold">{p.name}</h3>

                <div className="mt-2 flex items-center gap-2">
                  {p.is_on_sale && p.sale_price ? (
                    <>
                      <span className="text-[#C6A96B] font-semibold">
                        €{p.sale_price}
                      </span>
                      <span className="text-red-500 line-through text-sm">
                        €{p.price}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold">€{p.price}</span>
                  )}
                </div>

                <button
                  onClick={() => router.push('/shop')}
                  className="mt-3 w-full bg-[#C6A96B] text-white py-2 rounded-xl text-xs"
                >
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}