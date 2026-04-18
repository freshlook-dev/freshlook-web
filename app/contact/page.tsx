'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setSuccess('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error sending message')
        setLoading(false)
        return
      }

      setSuccess('Message sent successfully!')
      setName('')
      setPhone('')
      setMessage('')
    } catch (err) {
      alert('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <main className="w-full bg-[#F7EEDF] py-12">
      <div className="max-w-6xl mx-auto px-4">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-playfair mb-4">
            Contact Us
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            We’re here to help you with any questions or bookings
          </p>
        </div>

        {/* CONTENT */}
        <div className="grid md:grid-cols-2 gap-10">

          {/* LEFT - INFO */}
          <div className="space-y-6">

            <div className="bg-[#F7EEDF] border border-[#e5dccb] p-5 rounded-3xl shadow-md">
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-gray-600 text-sm">
                +383 44 459 659<br />
                +383 49 459 659 (WhatsApp)<br />
                +383 38 721 771
              </p>
            </div>

            <div className="bg-[#F7EEDF] border border-[#e5dccb] p-5 rounded-3xl shadow-md">
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-600 text-sm">
                info@freshlook-ks.com
              </p>
            </div>

            <div className="bg-[#F7EEDF] border border-[#e5dccb] p-5 rounded-3xl shadow-md">
              <h3 className="font-semibold mb-2">Locations</h3>
              <p className="text-gray-600 text-sm space-y-1">
                <a
                  href="https://www.google.com/maps/dir//FreshLook+Aesthetics+Prishtin%C3%AB,+Rruga,+nr.119+Rruga+Ferid+Curri"
                  target="_blank"
                  className="block hover:text-[#C6A96B]"
                >
                  Prishtinë – Rr. Ferid Curri (Arbëri)
                </a>

                <a
                  href="https://www.google.com/maps/dir//Fresh+Look+Aesthetics+Fush%C3%AB+Kosov%C3%AB,+17+Shkurti"
                  target="_blank"
                  className="block hover:text-[#C6A96B]"
                >
                  Fushë Kosovë – Rr. 17 Shkurti
                </a>
              </p>
            </div>

            {/* WHATSAPP */}
            <a
              href="https://wa.me/38349459659"
              target="_blank"
              className="block text-center bg-[#25D366] hover:bg-[#1ebe5d] transition text-white py-3 rounded-full shadow-md"
            >
              Chat on WhatsApp
            </a>

          </div>

          {/* RIGHT - FORM */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#F7EEDF] border border-[#e5dccb] p-6 rounded-3xl shadow-md"
          >
            <h3 className="font-semibold mb-4 text-lg">
              Send a Message
            </h3>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-[#e5dccb] rounded-xl bg-white"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-[#e5dccb] rounded-xl bg-white"
              />

              <textarea
                placeholder="Your Message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-[#e5dccb] rounded-xl bg-white"
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#C6A96B] hover:bg-[#b8965a] transition text-white py-3 rounded-full shadow-md"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>

              {success && (
                <p className="text-green-600 text-sm text-center">
                  {success}
                </p>
              )}

            </div>
          </motion.div>

        </div>

      </div>
    </main>
  )
}