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

  const [productIndex, setProductIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const visibleCount = 4

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

  const calcDiscount = (price: number, sale: number | null) => {
    if (!sale) return 0
    return Math.round(((price - sale) / price) * 100)
  }

  return (
    <main className="bg-[#F7EEDF] text-[#1A1A1A]">

      {/* HERO */}
      <section className="relative h-[40vh] sm:h-[70vh] md:h-[90vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
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
           onClick={() => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('track', 'InitiateCheckout', {
      content_name: currentSlide?.cta_text || 'Book Now',
    })
  }

  router.push(currentSlide?.cta_link || '/book')
}}
className="bg-[#C6A96B] px-8 py-3 rounded-full shadow-lg hover:scale-105"
>
{currentSlide?.cta_text || 'Book Now'}
          </button>
        </motion.div>
      </section>

      {/* SERVICES */}
      <section className="max-w-7xl mx-auto px-4 pt-6 pb-12 sm:pb-16">
        <h2 className="text-3xl sm:text-4xl font-playfair text-center mb-12">
          Treatments
        </h2>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4">
          {services.map((s) => (
            <motion.div key={s.id} whileHover={{ y: -6 }}
              className="snap-center min-w-[42%] sm:min-w-[23%] bg-white rounded-3xl shadow-lg flex flex-col relative"
            >
              {s.is_on_sale && s.sale_price && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
                  -{calcDiscount(s.price, s.sale_price)}%
                </div>
              )}

              <div
  onClick={() => router.push(`/services/${s.id}`)}
  className="aspect-[4/3] w-full bg-cover bg-center rounded-t-3xl overflow-hidden cursor-pointer"
  style={{ backgroundImage: `url(${s.image_url})` }}
/>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <h3 className="text-sm font-semibold">{s.name}</h3>

                <div className="mt-2">
                  {s.is_on_sale && s.sale_price ? (
                    <div className="flex gap-2 items-center">
                      <span className="text-[#C6A96B] font-semibold">
                        €{s.sale_price}
                      </span>
                      <span className="text-gray-400 line-through text-sm">
                        €{s.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#C6A96B] font-semibold">
                      €{s.price}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('track', 'InitiateCheckout')
  }

  router.push('/book')
}}
className="mt-4 w-full bg-[#C6A96B] text-white py-2.5 rounded-full text-sm"
>
Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="pt-6 pb-0 text-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { label: 'Happy Clients', value: 5000 },
            { label: 'Treatments Done', value: 12000 },
            { label: 'Years Experience', value: 5 },
            { label: '5★ Reviews', value: 500 },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
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

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4">
          {products.map((p) => (
            <motion.div key={p.id} whileHover={{ y: -6 }}
              className="snap-center min-w-[42%] sm:min-w-[23%] bg-white rounded-3xl shadow-lg flex flex-col relative"
            >
              {p.is_on_sale && p.sale_price && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
                  -{calcDiscount(p.price, p.sale_price)}%
                </div>
              )}

              <div
                onClick={() => router.push(`/shop/${p.id}`)}
                className="aspect-[4/3] w-full bg-cover bg-center cursor-pointer rounded-t-3xl overflow-hidden"
                style={{ backgroundImage: `url(${p.image_url})` }}
              />

              <div className="p-4 flex flex-col flex-1 justify-between">
                <h3 className="text-sm font-semibold">{p.name}</h3>

                <div className="mt-2">
                  {p.is_on_sale && p.sale_price ? (
                    <div className="flex gap-2 items-center">
                      <span className="text-[#C6A96B] font-semibold">
                        €{p.sale_price}
                      </span>
                      <span className="text-gray-400 line-through text-sm">
                        €{p.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#C6A96B] font-semibold">
                      €{p.price}
                    </span>
                  )}
                </div>

                <button
                 onClick={() => {
  addToCart({
    ...p,
    image: p.image_url,
  })

  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('track', 'AddToCart', {
      content_name: p.name,
      content_ids: [p.id],
      content_type: 'product',
      value: p.price,
      currency: 'EUR',
    })
  }
}
                  }
                  className="mt-4 w-full bg-[#C6A96B] text-white py-2.5 rounded-full text-sm"
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

            <div
              className="aspect-[4/3] w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${selectedProduct.image_url})` }}
            />

            <div className="p-5">
              <h2 className="text-lg font-semibold">{selectedProduct.name}</h2>

              <button
                onClick={() => {
  addToCart({
    ...selectedProduct,
    image: selectedProduct.image_url,
  })

  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('track', 'AddToCart', {
      content_name: selectedProduct.name,
      content_ids: [selectedProduct.id],
      content_type: 'product',
      value: selectedProduct.price,
      currency: 'EUR',
    })
  }
}}
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