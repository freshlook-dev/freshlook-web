'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useRouter } from 'next/navigation'
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
  is_out_of_stock: boolean
}

type Slide = {
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  image_desktop: string
  image_mobile: string
}

type TrackPayload = Record<
  string,
  string | number | boolean | null | string[] | undefined
>

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
  }, [count, rounded, value])

  return <span>{display}+</span>
}

export default function HomePage() {
  const router = useRouter()
  const { addToCart } = useCart()

  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [current, setCurrent] = useState(0)

  const trackFbEvent = (event: string, data?: TrackPayload) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', event, data)
    }
  }

  async function fetchData() {
    const { data: serviceData } = await supabase.from('services').select('*')
    const { data: productData } = await supabase.from('products').select('*')

    if (serviceData) {
      setServices(serviceData)
    }

    if (productData) {
      setProducts(productData)
    }
  }

  async function fetchHero() {
    const { data } = await supabase
      .from('content')
      .select('*')
      .eq('key', 'hero')
      .single()

    if (data?.value?.slides) {
      setSlides(data.value.slides as Slide[])
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData()
      void fetchHero()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!slides.length) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides])

  const currentSlide = slides[current]

  const calcDiscount = (price: number, sale: number | null) => {
    if (!sale) return 0
    return Math.round(((price - sale) / price) * 100)
  }

  return (
    <main className="bg-[#F7EEDF] text-[#1A1A1A]">
      <section className="relative flex h-[40vh] items-center justify-center overflow-hidden text-center sm:h-[70vh] md:h-[90vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${currentSlide?.image_desktop || '/assets/product1.jpg'})`,
          }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <motion.div
          key={current}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-2xl px-6 text-white"
        >
          <h1 className="mb-6 text-3xl font-playfair sm:text-5xl md:text-6xl">
            {currentSlide?.title || 'Elevate Your Beauty Experience'}
          </h1>

          <p className="mb-8 text-gray-200">
            {currentSlide?.subtitle || 'Premium treatments tailored to perfection'}
          </p>

          <button
            onClick={() => {
              trackFbEvent('InitiateCheckout', {
                content_name: currentSlide?.cta_text || 'Book Now',
              })
              router.push(currentSlide?.cta_link || '/book')
            }}
            className="rounded-full bg-[#C6A96B] px-8 py-3 shadow-lg hover:scale-105"
          >
            {currentSlide?.cta_text || 'Book Now'}
          </button>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:pb-16">
        <h2 className="mb-12 text-center text-3xl font-playfair sm:text-4xl">
          Treatments
        </h2>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto py-4">
          {services.map((service) => (
            <motion.div
              key={service.id}
              whileHover={{ y: -6 }}
              className="relative flex min-w-[42%] snap-center flex-col rounded-3xl bg-white shadow-lg sm:min-w-[23%]"
            >
              {service.is_on_sale && service.sale_price && (
                <div className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                  -{calcDiscount(service.price, service.sale_price)}%
                </div>
              )}

              <div
                onClick={() => router.push(`/services/${service.id}`)}
                className="aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-t-3xl bg-cover bg-center"
                style={{ backgroundImage: `url(${service.image_url})` }}
              />

              <div className="flex flex-1 flex-col justify-between p-4">
                <h3 className="text-sm font-semibold">{service.name}</h3>

                <div className="mt-2">
                  {service.is_on_sale && service.sale_price ? (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#C6A96B]">
                        EUR {service.sale_price}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        EUR {service.price}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-[#C6A96B]">
                      EUR {service.price}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    trackFbEvent('InitiateCheckout')
                    router.push('/book')
                  }}
                  className="mt-4 w-full rounded-full bg-[#C6A96B] py-2.5 text-sm text-white"
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="pb-0 pt-6 text-center">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { label: 'Happy Clients', value: 5000 },
            { label: 'Treatments Done', value: 12000 },
            { label: 'Years Experience', value: 5 },
            { label: '5-Star Reviews', value: 500 },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
              <h3 className="text-4xl font-bold text-[#C6A96B]">
                <Counter value={item.value} />
              </h3>
              <p className="mt-2 text-sm text-gray-600">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <h2 className="mb-12 text-center text-3xl font-playfair sm:text-4xl">
          Skin Care Products Shop
        </h2>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto py-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -6 }}
              className="relative flex min-w-[42%] snap-center flex-col rounded-3xl bg-white shadow-lg sm:min-w-[23%]"
            >
              {product.is_out_of_stock && (
                <div className="absolute right-3 top-3 z-10 rounded-full bg-gray-900/85 px-2 py-1 text-xs text-white">
                  Out of Stock
                </div>
              )}
              {product.is_on_sale && product.sale_price && (
                <div className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                  -{calcDiscount(product.price, product.sale_price)}%
                </div>
              )}

              <div
                onClick={() => router.push(`/shop/${product.id}`)}
                className={`aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-t-3xl bg-cover bg-center ${
                  product.is_out_of_stock ? 'grayscale opacity-70' : ''
                }`}
                style={{ backgroundImage: `url(${product.image_url})` }}
              />

              <div className="flex flex-1 flex-col justify-between p-4">
                <h3 className="text-sm font-semibold">{product.name}</h3>

                <div className="mt-2">
                  {product.is_on_sale && product.sale_price ? (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#C6A96B]">
                        EUR {product.sale_price}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        EUR {product.price}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-[#C6A96B]">
                      EUR {product.price}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (product.is_out_of_stock) {
                      return
                    }

                    addToCart({
                      ...product,
                      image: product.image_url,
                    })

                    trackFbEvent('AddToCart', {
                      content_name: product.name,
                      content_ids: [product.id],
                      content_type: 'product',
                      value: product.price,
                      currency: 'EUR',
                    })
                  }}
                  disabled={product.is_out_of_stock}
                  className={`mt-4 w-full rounded-full py-2.5 text-sm ${
                    product.is_out_of_stock
                      ? 'cursor-not-allowed bg-gray-300 text-gray-600'
                      : 'bg-[#C6A96B] text-white'
                  }`}
                >
                  {product.is_out_of_stock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
