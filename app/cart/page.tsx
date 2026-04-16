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
    promo,
    applyPromo,
    removePromo,
    subtotal,
    discount,
    total,
  } = useCart()

  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState('')

  // ✅ APPLY PROMO (NOW USES CONTEXT)
  const handleApplyPromo = async () => {
    setPromoMessage('')

    if (!promoCode) return

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !data) {
      setPromoMessage('Invalid code')
      return
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setPromoMessage('Code expired')
      return
    }

    // ✅ CLEAN OBJECT (IMPORTANT)
    applyPromo({
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
    })

    setPromoMessage('Promo applied successfully')
  }

  return (
    <main className="w-full px-4 py-10 max-w-4xl mx-auto">

      <h1 className="text-3xl font-playfair mb-6">Your Cart</h1>

      {cart.length === 0 && (
        <p className="text-gray-500">Your cart is empty</p>
      )}

      {/* ITEMS */}
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

                  {/* SALE DISPLAY */}
                  {item.is_on_sale && item.sale_price && (
                    <p className="text-xs text-red-500 line-through">
                      €{item.price}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="px-2 border rounded"
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() => increaseQty(item.id)}
                  className="px-2 border rounded"
                >
                  +
                </button>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 ml-3 text-sm"
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
            onClick={handleApplyPromo}
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

        {/* ACTIVE PROMO DISPLAY */}
        {promo && (
          <div className="mt-3 flex justify-between items-center text-sm text-green-600">
            <span>
              Applied: {promo.code} (
              {promo.discount_type === 'percentage'
                ? `${promo.discount_value}%`
                : `€${promo.discount_value}`}
              )
            </span>

            <button
              onClick={removePromo}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
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
          <span className="text-[#C6A96B]">
            €{total.toFixed(2)}
          </span>
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
  onClick={() => {
    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }
    router.push('/checkout')
  }}
  disabled={cart.length === 0}
  className={`flex-1 py-2 rounded ${
    cart.length === 0
      ? 'bg-gray-300 cursor-not-allowed'
      : 'bg-[#C6A96B] text-white'
  }`}
>
  Checkout
</button>
      </div>

    </main>
  )
}