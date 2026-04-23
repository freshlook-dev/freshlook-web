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

type PromoCodeRecord = {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  expires_at: string | null
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
  const hasOutOfStockItems = cart.some((item) => item.is_out_of_stock)

  const handleApplyPromo = async () => {
    setPromoMessage('')

    if (!promoCode) return

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .single<PromoCodeRecord>()

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
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-0 right-0 h-full w-[380px] max-w-full bg-[#FAF7F2] z-[9999] shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold">Your Cart</h2>
              <button onClick={onClose} aria-label="Close cart">
                <X />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">Your cart is empty</p>
              ) : (
                <>
                  {hasOutOfStockItems && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      Some cart items are out of stock. Remove them before checkout.
                    </div>
                  )}

                  {cart.map((item) => {
                    const price =
                      item.is_on_sale && item.sale_price
                        ? item.sale_price
                        : item.price

                    return (
                      <div key={item.id} className="flex gap-3 border-b pb-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>

                          <p className="text-xs text-gray-500">
                            EUR {price} x {item.quantity}
                          </p>

                          {item.is_on_sale && item.sale_price && (
                            <p className="text-xs text-red-500 line-through">
                              EUR {item.price}
                            </p>
                          )}

                          {item.is_out_of_stock && (
                            <p className="text-xs font-medium text-red-600 mt-1">
                              Out of stock
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => decreaseQty(item.id)}
                              className="px-2 border rounded"
                              aria-label={`Decrease quantity for ${item.name}`}
                            >
                              -
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              onClick={() => increaseQty(item.id)}
                              disabled={item.is_out_of_stock}
                              className={`px-2 border rounded ${
                                item.is_out_of_stock ? 'cursor-not-allowed opacity-50' : ''
                              }`}
                              aria-label={`Increase quantity for ${item.name}`}
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
                  })}
                </>
              )}
            </div>

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
                  <p className="text-xs mt-2 text-gray-500">{promoMessage}</p>
                )}

                {promo && (
                  <div className="mt-2 flex justify-between text-xs text-green-600">
                    <span>
                      {promo.code} (
                      {promo.discount_type === 'percentage'
                        ? `${promo.discount_value}%`
                        : `EUR ${promo.discount_value}`}
                      )
                    </span>

                    <button onClick={removePromo} className="text-red-500">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t space-y-3">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>EUR {subtotal.toFixed(2)}</span>
                </div>

                {promo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-EUR {discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-[#C6A96B]">
                    EUR {total.toFixed(2)}
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

                  if (hasOutOfStockItems) {
                    alert('Remove out-of-stock items before checkout')
                    return
                  }

                  onClose()
                  router.push('/checkout')
                }}
                disabled={hasOutOfStockItems}
                className={`w-full py-3 rounded-xl font-medium ${
                  hasOutOfStockItems
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-[#C6A96B] text-white'
                }`}
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
