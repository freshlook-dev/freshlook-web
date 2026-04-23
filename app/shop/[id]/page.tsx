'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useCart } from '@/context/CartContext'

type Product = {
  id: string
  name: string
  description: string
  price: number
  sale_price: number | null
  is_on_sale: boolean
  image_url: string
  is_out_of_stock: boolean
}

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])

  useEffect(() => {
    if (!product) return

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value:
          product.is_on_sale && product.sale_price
            ? product.sale_price
            : product.price,
        currency: 'EUR',
      })
    }
  }, [product])

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      setProduct(data as Product | null)

      if (data) {
        const { data: relatedProducts } = await supabase
          .from('products')
          .select('*')
          .neq('id', data.id)
          .limit(4)

        setRelated((relatedProducts as Product[]) || [])
      }
    }

    if (id) {
      void fetchProduct()
    }
  }, [id])

  if (!product) return <div className="p-10">Loading...</div>

  const isSale = product.is_on_sale && product.sale_price
  const discount = isSale
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0

  const savings = isSale
    ? (product.price - product.sale_price!).toFixed(2)
    : '0.00'

  const finalPrice = isSale ? product.sale_price! : product.price

  const handleAddToCart = () => {
    if (product.is_out_of_stock) return

    addToCart({
      ...product,
      image: product.image_url,
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
    <div className="max-w-6xl mx-auto px-4 py-10 pb-24">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-gray-500"
      >
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative">
          {isSale && !product.is_out_of_stock && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
              -{discount}%
            </div>
          )}

          {product.is_out_of_stock && (
            <div className="absolute top-3 left-3 bg-gray-900/85 text-white text-xs px-3 py-1 rounded-full z-10">
              Out of Stock
            </div>
          )}

          <div
            className={`aspect-[4/3] bg-cover bg-center rounded-2xl ${product.is_out_of_stock ? 'grayscale opacity-70' : ''}`}
            style={{ backgroundImage: `url(${product.image_url})` }}
          />
        </div>

        <div>
          <h1 className="text-2xl font-semibold mb-4">
            {product.name}
          </h1>

          {isSale ? (
            <div className="mb-4">
              <div className="flex gap-3 items-center">
                <span className="text-2xl text-[#C6A96B] font-bold">
                  EUR {product.sale_price}
                </span>
                <span className="line-through text-gray-400">
                  EUR {product.price}
                </span>
              </div>

              <p className="text-sm text-green-600 mt-1">
                You save EUR {savings}
              </p>
            </div>
          ) : (
            <div className="text-2xl text-[#C6A96B] font-bold mb-4">
              EUR {product.price}
            </div>
          )}

          {product.is_out_of_stock && (
            <p className="mb-4 text-sm font-medium text-red-600">
              This product is currently out of stock.
            </p>
          )}

          <ul className="space-y-2 text-gray-600 mb-6">
            {(product.description || '')
              .split('.')
              .filter(Boolean)
              .map((line, index) => (
                <li key={index}>- {line.trim()}</li>
              ))}
          </ul>

          <button
            onClick={handleAddToCart}
            disabled={product.is_out_of_stock}
            className={`px-6 py-3 rounded-full ${
              product.is_out_of_stock
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-[#C6A96B] text-white'
            }`}
          >
            {product.is_out_of_stock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-xl font-semibold mb-6">
          You may also like
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {related.map((relatedProduct) => (
            <div
              key={relatedProduct.id}
              onClick={() => router.push(`/shop/${relatedProduct.id}`)}
              className="cursor-pointer hover:opacity-80 transition"
            >
              <div
                className={`aspect-[4/3] bg-cover bg-center rounded-xl ${relatedProduct.is_out_of_stock ? 'grayscale opacity-70' : ''}`}
                style={{ backgroundImage: `url(${relatedProduct.image_url})` }}
              />
              <p className="text-sm mt-2">{relatedProduct.name}</p>
              {relatedProduct.is_out_of_stock && (
                <p className="text-xs text-red-600">Out of Stock</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-between items-center md:hidden z-50">
        <div className="flex items-center gap-2">
          {isSale ? (
            <>
              <span className="font-semibold text-[#C6A96B]">
                EUR {product.sale_price}
              </span>
              <span className="text-xs text-gray-400 line-through">
                EUR {product.price}
              </span>
            </>
          ) : (
            <span className="font-semibold text-[#C6A96B]">
              EUR {product.price}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.is_out_of_stock}
          className={`px-6 py-2 rounded-full ${
            product.is_out_of_stock
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-[#C6A96B] text-white'
          }`}
        >
          {product.is_out_of_stock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
