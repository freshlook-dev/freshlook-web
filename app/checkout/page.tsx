'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase/client'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart } = useCart()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    instructions: '',
    payment_method: 'cash',
  })

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const subtotal = cart.reduce((acc, item) => {
    const price =
      item.is_on_sale && item.sale_price
        ? item.sale_price
        : item.price

    return acc + price * item.quantity
  }, 0)

  const handleCheckout = async () => {
    if (!form.full_name || !form.phone || !form.address) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('orders').insert([
      {
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
        instructions: form.instructions,
        payment_method: form.payment_method,
        items: cart,
        subtotal,
        total: subtotal,
        status: 'pending',
      },
    ])

    setLoading(false)

    if (!error) {
      clearCart()
      router.push('/checkout-success')
    } else {
      alert('Something went wrong')
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-playfair mb-6">Checkout</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <input
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="Full Address"
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <textarea
          placeholder="Delivery Instructions (optional)"
          value={form.instructions}
          onChange={(e) => handleChange('instructions', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        {/* PAYMENT */}
        <div>
          <p className="font-semibold mb-2">Payment Method</p>

          <div className="flex gap-4">
            <button
              onClick={() => handleChange('payment_method', 'cash')}
              className={`flex-1 border p-3 rounded-xl ${
                form.payment_method === 'cash'
                  ? 'border-[#C6A96B]'
                  : ''
              }`}
            >
              Cash on Delivery
            </button>

            <button
              onClick={() => handleChange('payment_method', 'card')}
              className={`flex-1 border p-3 rounded-xl ${
                form.payment_method === 'card'
                  ? 'border-[#C6A96B]'
                  : ''
              }`}
            >
              Pay with Card
            </button>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-[#C6A96B] text-white py-3 rounded-xl"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>

      </div>

    </main>
  )
}