'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useCart } from '@/context/CartContext'

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])

  // ✅ ViewContent
  useEffect(() => {
    if (!product) return

    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value:
          product.is_on_sale && product.sale_price
            ? product.sale_price
            : product.price,
        currency: 'EUR'
      })
    }
  }, [product])

  // ✅ Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      setProduct(data)

      if (data) {
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .neq('id', data.id)
          .limit(4)

        setRelated(rel || [])
      }
    }

    if (id) fetchProduct()
  }, [id])

  if (!product) return <div className="p-10">Loading...</div>

  const isSale = product.is_on_sale && product.sale_price
  const discount = isSale
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0

  const savings = isSale
    ? (product.price - product.sale_price).toFixed(2)
    : 0

  const finalPrice =
    product.is_on_sale && product.sale_price
      ? product.sale_price
      : product.price

  const handleAddToCart = () => {
    addToCart({
      ...product,
      image: product.image_url,
    })

    // ✅ Meta Pixel AddToCart
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: finalPrice,
        currency: 'EUR'
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 pb-24">

      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-gray-500"
      >
        ← Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">

        {/* IMAGE */}
        <div className="relative">
          {isSale && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
              -{discount}%
            </div>
          )}

          <div
            className="aspect-[4/3] bg-cover bg-center rounded-2xl"
            style={{ backgroundImage: `url(${product.image_url})` }}
          />
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-2xl font-semibold mb-4">
            {product.name}
          </h1>

          {/* PRICE */}
          {isSale ? (
            <div className="mb-4">
              <div className="flex gap-3 items-center">
                <span className="text-2xl text-[#C6A96B] font-bold">
                  €{product.sale_price}
                </span>
                <span className="line-through text-gray-400">
                  €{product.price}
                </span>
              </div>

              <p className="text-sm text-green-600 mt-1">
                You save €{savings}
              </p>
            </div>
          ) : (
            <div className="text-2xl text-[#C6A96B] font-bold mb-4">
              €{product.price}
            </div>
          )}

          {/* DESCRIPTION */}
          <ul className="space-y-2 text-gray-600 mb-6">
            {(product.description || '')
              .split('.')
              .filter(Boolean)
              .map((line: string, i: number) => (
                <li key={i}>• {line}</li>
              ))}
          </ul>

          {/* ADD TO CART */}
          <button
            onClick={handleAddToCart}
            className="bg-[#C6A96B] text-white px-6 py-3 rounded-full"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* RELATED */}
      <div className="mt-16">
        <h3 className="text-xl font-semibold mb-6">
          You may also like
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {related.map((r) => (
            <div
              key={r.id}
              onClick={() => router.push(`/shop/${r.id}`)}
              className="cursor-pointer hover:opacity-80 transition"
            >
              <div
                className="aspect-[4/3] bg-cover bg-center rounded-xl"
                style={{ backgroundImage: `url(${r.image_url})` }}
              />
              <p className="text-sm mt-2">{r.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STICKY MOBILE BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-between items-center md:hidden z-50">
        <div className="flex items-center gap-2">
          {isSale ? (
            <>
              <span className="font-semibold text-[#C6A96B]">
                €{product.sale_price}
              </span>
              <span className="text-xs text-gray-400 line-through">
                €{product.price}
              </span>
            </>
          ) : (
            <span className="font-semibold text-[#C6A96B]">
              €{product.price}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="bg-[#C6A96B] text-white px-6 py-2 rounded-full"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}