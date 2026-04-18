'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase/client'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: Props) {
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

  // ✅ SAME PROMO LOGIC
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

    applyPromo({
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
    })

    setPromoMessage('Promo applied successfully')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* DRAWER */}
          <motion.div
            className="fixed top-0 right-0 h-full w-[380px] max-w-full bg-[#FAF7F2] z-[9999] shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold">Your Cart</h2>
              <button onClick={onClose}>
                <X />
              </button>
            </div>

            {/* ITEMS */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">Your cart is empty</p>
              ) : (
                cart.map((item: any) => {
                  const price =
                    item.is_on_sale && item.sale_price
                      ? item.sale_price
                      : item.price

                  return (
                    <div key={item.id} className="flex gap-3 border-b pb-4">
                      <img
                        src={item.image}
                        className="w-16 h-16 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>

                        <p className="text-xs text-gray-500">
                          €{price} × {item.quantity}
                        </p>

                        {item.is_on_sale && item.sale_price && (
                          <p className="text-xs text-red-500 line-through">
                            €{item.price}
                          </p>
                        )}

                        {/* QUANTITY */}
                        <div className="flex items-center gap-2 mt-2">
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
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* PROMO */}
            <div className="px-5 pb-4">
              <div className="bg-white p-3 rounded-xl shadow">
                <h3 className="text-sm font-semibold mb-2">Promo Code</h3>

                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="border p-2 rounded w-full text-sm"
                  />

                  <button
                    onClick={handleApplyPromo}
                    className="bg-[#C6A96B] text-white px-3 rounded text-sm"
                  >
                    Apply
                  </button>
                </div>

                {promoMessage && (
                  <p className="text-xs mt-2 text-gray-500">
                    {promoMessage}
                  </p>
                )}

                {promo && (
                  <div className="mt-2 flex justify-between text-xs text-green-600">
                    <span>
                      {promo.code} (
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
            </div>

            {/* TOTAL + ACTIONS */}
            <div className="p-5 border-t space-y-3">
              <div className="text-sm space-y-1">
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

                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-[#C6A96B]">
                    €{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={clearCart}
                className="w-full border py-2 rounded text-sm"
              >
                Clear Cart
              </button>

              <button
                onClick={() => {
                  if (cart.length === 0) {
                    alert('Your cart is empty')
                    return
                  }
                  onClose()
                  router.push('/checkout')
                }}
                className="w-full bg-[#C6A96B] text-white py-3 rounded-xl font-medium"
              >
                Checkout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}