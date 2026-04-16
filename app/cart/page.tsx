'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase/client'

export default function CartPage() {
  const router = useRouter()

  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
  } = useCart()

  const [promoCode, setPromoCode] = useState('')
  const [promo, setPromo] = useState<any>(null)
  const [promoMessage, setPromoMessage] = useState('')

  // ✅ SUBTOTAL (SALE AWARE)
  const subtotal = cart.reduce((acc, item) => {
    const price =
      item.is_on_sale && item.sale_price
        ? item.sale_price
        : item.price

    return acc + price * item.quantity
  }, 0)

  // ✅ DISCOUNT
  let discount = 0

  if (promo) {
    if (promo.discount_type === 'percentage') {
      discount = (subtotal * promo.discount_value) / 100
    } else {
      discount = promo.discount_value
    }
  }

  const total = Math.max(subtotal - discount, 0)

  // ✅ APPLY PROMO
  const applyPromo = async () => {
    setPromoMessage('')

    if (!promoCode) return

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !data) {
      setPromo(null)
      setPromoMessage('Invalid code')
      return
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setPromo(null)
      setPromoMessage('Code expired')
      return
    }

    setPromo(data)
    setPromoMessage('Promo applied successfully')
  }

  return (
    <main className="w-full px-4 py-10 max-w-4xl mx-auto">

      <h1 className="text-3xl font-playfair mb-6">Your Cart</h1>

      {cart.length === 0 && (
        <p className="text-gray-500">Your cart is empty</p>
      )}

      <div className="space-y-4">
        {cart.map((item) => {
          const price =
            item.is_on_sale && item.sale_price
              ? item.sale_price
              : item.price

          return (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white p-4 rounded-xl shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  className="w-16 h-16 object-cover rounded"
                />

                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    €{price} × {item.quantity}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => decreaseQty(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => increaseQty(item.id)}>+</button>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 ml-3"
                >
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* PROMO */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Promo Code</h3>

        <div className="flex gap-2">
          <input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter code"
            className="border p-2 rounded w-full"
          />

          <button
            onClick={applyPromo}
            className="bg-[#C6A96B] text-white px-4 rounded"
          >
            Apply
          </button>
        </div>

        {promoMessage && (
          <p className="text-sm mt-2 text-gray-500">
            {promoMessage}
          </p>
        )}
      </div>

      {/* TOTAL */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>

        {promo && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-€{discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>€{total.toFixed(2)}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={clearCart}
          className="flex-1 border py-2 rounded"
        >
          Clear Cart
        </button>

        <button
          onClick={() => router.push('/checkout')}
          className="flex-1 bg-[#C6A96B] text-white py-2 rounded"
        >
          Checkout
        </button>
      </div>

    </main>
  )
}