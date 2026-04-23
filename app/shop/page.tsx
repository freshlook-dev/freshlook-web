'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import { useCart } from '@/context/CartContext'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Product = {
  id: string
  name: string
  subtitle: string
  description: string
  price: number
  sale_price: number | null
  is_on_sale: boolean
  image_url: string | null
  is_active: boolean
  is_out_of_stock: boolean
}

export default function ShopPage() {
  const { addToCart } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setProducts(data as Product[])
      }

      setLoading(false)
    }

    void fetchProducts()
  }, [])

  const getDiscount = (price: number, sale: number) => {
    return Math.round(((price - sale) / price) * 100)
  }

  const getImageUrl = (url: string | null) => {
    return url || ''
  }

  const handleAddToCart = (product: Product) => {
    if (product.is_out_of_stock) return

    const finalPrice =
      product.is_on_sale && product.sale_price
        ? product.sale_price
        : product.price

    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: getImageUrl(product.image_url),
      is_out_of_stock: product.is_out_of_stock,
    })

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: finalPrice,
        currency: 'EUR',
      })
    }
  }

  return (
    <main className="w-full px-4 py-10 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-playfair mb-3">
          Shop Products
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Premium skincare products for your daily routine
        </p>
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading products...</p>
      )}

      {!loading && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {products.map((product) => {
            const isExpanded = expanded === product.id

            return (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden relative"
              >
                {product.is_on_sale && product.sale_price && !product.is_out_of_stock && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg z-10">
                    -{getDiscount(product.price, product.sale_price)}%
                  </div>
                )}

                {product.is_out_of_stock && (
                  <div className="absolute top-2 left-2 bg-gray-900/85 text-white text-xs px-2 py-1 rounded-lg z-10">
                    Out of Stock
                  </div>
                )}

                <div
                  className={`h-36 sm:h-44 bg-cover bg-center ${product.is_out_of_stock ? 'grayscale opacity-70' : ''}`}
                  style={{
                    backgroundImage: `url(${getImageUrl(product.image_url)})`,
                  }}
                />

                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base">
                    {product.name}
                  </h3>

                  <p className="text-gray-400 text-xs">
                    {product.subtitle}
                  </p>

                  <div className="mt-1 text-sm">
                    {product.is_on_sale && product.sale_price ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">
                          EUR {product.price}
                        </span>
                        <span className="text-[#C6A96B] font-semibold">
                          EUR {product.sale_price}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-700">
                        EUR {product.price}
                      </span>
                    )}
                  </div>

                  {product.is_out_of_stock && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      This product is currently out of stock.
                    </p>
                  )}

                  <button
                    onClick={() => setExpanded(isExpanded ? null : product.id)}
                    className="mt-2 text-xs text-[#C6A96B]"
                  >
                    {isExpanded ? 'Hide details' : 'View details'}
                  </button>

                  {isExpanded && (
                    <p className="mt-2 text-xs text-gray-500">
                      {product.description}
                    </p>
                  )}

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.is_out_of_stock}
                    className={`mt-3 w-full py-2 rounded-xl text-sm ${
                      product.is_out_of_stock
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-[#C6A96B] text-white'
                    }`}
                  >
                    {product.is_out_of_stock ? 'Out of Stock' : 'Add to Cart'}
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
