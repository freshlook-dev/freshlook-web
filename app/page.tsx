'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'

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

function Counter({ value }: { value: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.floor(latest))
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(count, value, { duration: 2 })
    const unsubscribe = rounded.on('change', (v) => setDisplay(v))
    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [value])

  return <span>{display}+</span>
}

export default function HomePage() {
  const router = useRouter()
  const { addToCart } = useCart()

  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [current, setCurrent] = useState(0)

  const [serviceIndex, setServiceIndex] = useState(0)
  const [productIndex, setProductIndex] = useState(0)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const visibleCount = 4
  const step = 1

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
    const { data: s } = await supabase.from('services').select('*')
    const { data: p } = await supabase.from('products').select('*')
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
    <main className="bg-[#F7EEDF] text-[#1A1A1A]">

      {/* HERO */}
      <section className="relative h-[90vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url(${currentSlide?.image_desktop || '/assets/product1.jpg'})` }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <motion.div
          key={current}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-white max-w-2xl px-6"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-playfair mb-6">
            {currentSlide?.title || 'Elevate Your Beauty Experience'}
          </h1>

          <p className="mb-8 text-gray-200">
            {currentSlide?.subtitle || 'Premium treatments tailored to perfection'}
          </p>

          <button
            onClick={() => router.push(currentSlide?.cta_link || '/book')}
            className="bg-[#C6A96B] px-8 py-3 rounded-full shadow-lg hover:scale-105"
          >
            {currentSlide?.cta_text || 'Book Now'}
          </button>
        </motion.div>
      </section>

      {/* SERVICES */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <h2 className="text-3xl sm:text-4xl font-playfair text-center mb-12">
          Treatments
        </h2>

        <div className="flex sm:grid sm:grid-cols-4 gap-6 overflow-x-auto snap-x snap-mandatory">
          {services.slice(serviceIndex, serviceIndex + visibleCount).map((s) => (
            <div key={s.id} className="snap-center min-w-[65%] sm:min-w-0 bg-white rounded-3xl shadow-lg flex flex-col">
              <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${s.image_url})` }} />
              <div className="p-5 flex flex-col flex-1 justify-between">
                <h3 className="text-sm font-semibold">{s.name}</h3>
                <button onClick={() => router.push('/book')} className="mt-4 w-full bg-[#C6A96B] text-white py-3 rounded-full">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 text-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { label: 'Happy Clients', value: 5000 },
            { label: 'Treatments Done', value: 12000 },
            { label: 'Years Experience', value: 5 },
            { label: '5★ Reviews', value: 500 },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <h3 className="text-4xl font-bold text-[#C6A96B]">
                <Counter value={item.value} />
              </h3>
              <p className="text-sm mt-2 text-gray-600">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <h2 className="text-3xl sm:text-4xl font-playfair text-center mb-12">
          Skin Care Products Shop
        </h2>

        <div className="flex sm:grid sm:grid-cols-4 gap-6 overflow-x-auto snap-x snap-mandatory">
          {products.slice(productIndex, productIndex + visibleCount).map((p) => (
            <motion.div key={p.id} whileHover={{ y: -6 }}
              className="snap-center min-w-[65%] sm:min-w-0 bg-white rounded-3xl shadow-lg flex flex-col"
            >
              <div onClick={() => setSelectedProduct(p)}
                className="h-40 bg-cover bg-center cursor-pointer"
                style={{ backgroundImage: `url(${p.image_url})` }}
              />

              <div className="p-5 flex flex-col flex-1 justify-between">
                <h3 className="text-sm font-semibold">{p.name}</h3>

                <button
                  onClick={() =>
                    addToCart({
                      ...p,
                      image: p.image_url,
                    })
                  }
                  className="mt-4 w-full bg-[#C6A96B] text-white py-3 rounded-full"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-3 right-3">
              <X />
            </button>

            <div className="h-60 bg-cover bg-center"
              style={{ backgroundImage: `url(${selectedProduct.image_url})` }}
            />

            <div className="p-5">
              <h2 className="text-lg font-semibold">{selectedProduct.name}</h2>

              <button
                onClick={() =>
                  addToCart({
                    ...selectedProduct,
                    image: selectedProduct.image_url,
                  })
                }
                className="mt-6 w-full bg-[#C6A96B] text-white py-3 rounded-full"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}