'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'

export default function CheckoutPage() {
  const router = useRouter()

  const {
    cart,
    subtotal,
    total,
    discount,
    promo,
    clearCart,
  } = useCart()

  const [loading, setLoading] = useState(false)
  const hasOutOfStockItems = cart.some((item) => item.is_out_of_stock)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    instructions: '',
    payment_method: 'cash' as 'cash' | 'card',
  })

  const handleChange = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert('Cart is empty')
      return
    }

    if (hasOutOfStockItems) {
      alert('Remove out-of-stock items before placing the order')
      return
    }

    if (!form.full_name || !form.phone || !form.address) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const items = cart.map((item) => {
      const finalPrice =
        item.is_on_sale && item.sale_price
          ? item.sale_price
          : item.price

      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: finalPrice,
      }
    })

    const { error } = await supabase.from('orders').insert([
      {
        ...form,
        user_id: user?.id || null,
        items,
        subtotal,
        discount,
        total,
        promo_code: promo?.code || null,
        status: 'pending',
      },
    ])

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    clearCart()
    router.push('/success')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      {hasOutOfStockItems && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Some items in your cart are out of stock. Go back to your cart and remove them before placing the order.
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <input
          placeholder="Full Name *"
          value={form.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="Phone *"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="Address *"
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <textarea
          placeholder="Instructions (optional)"
          value={form.instructions}
          onChange={(e) => handleChange('instructions', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <select
          value={form.payment_method}
          onChange={(e) => handleChange('payment_method', e.target.value as 'cash' | 'card')}
          className="w-full border p-3 rounded-xl"
        >
          <option value="cash">Cash on Delivery</option>
          <option value="card">Card (later)</option>
        </select>
      </div>

      <div className="mt-6 bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-3">Order Summary</h2>

        {cart.map((item, i) => {
          const price =
            item.is_on_sale && item.sale_price
              ? item.sale_price
              : item.price

          return (
            <div key={i} className="flex justify-between text-sm mb-1">
              <span>
                {item.name} x {item.quantity}
                {item.is_out_of_stock ? ' (Out of stock)' : ''}
              </span>
              <span>EUR {(item.quantity * price).toFixed(2)}</span>
            </div>
          )
        })}

        <div className="mt-4 border-t pt-3 text-sm flex justify-between">
          <span>Subtotal</span>
          <span>EUR {subtotal.toFixed(2)}</span>
        </div>

        {promo && (
          <div className="flex justify-between text-green-600 text-sm">
            <span>Discount ({promo.code})</span>
            <span>-EUR {discount.toFixed(2)}</span>
          </div>
        )}

        <div className="mt-2 font-semibold flex justify-between">
          <span>Total</span>
          <span className="text-[#C6A96B]">EUR {total.toFixed(2)}</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || cart.length === 0 || hasOutOfStockItems}
          className={`mt-4 w-full py-3 rounded-xl ${
            cart.length === 0 || hasOutOfStockItems
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#C6A96B] text-white'
          }`}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  )
}
