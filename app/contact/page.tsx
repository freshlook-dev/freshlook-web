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
    } catch {
      alert('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <main className="w-full bg-[#F7EEDF] py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-playfair sm:text-5xl">Contact Us</h1>
          <p className="text-sm text-gray-500 sm:text-base">
            We&apos;re here to help you with any questions or bookings
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#e5dccb] bg-[#F7EEDF] p-5 shadow-md">
              <h3 className="mb-2 font-semibold">Phone</h3>
              <p className="text-sm text-gray-600">
                +383 44 459 659
                <br />
                +383 49 459 659 (WhatsApp)
                <br />
                +383 38 721 771
              </p>
            </div>

            <div className="rounded-3xl border border-[#e5dccb] bg-[#F7EEDF] p-5 shadow-md">
              <h3 className="mb-2 font-semibold">Email</h3>
              <p className="text-sm text-gray-600">info@freshlook-ks.com</p>
            </div>

            <div className="rounded-3xl border border-[#e5dccb] bg-[#F7EEDF] p-5 shadow-md">
              <h3 className="mb-2 font-semibold">Locations</h3>
              <p className="space-y-1 text-sm text-gray-600">
                <a
                  href="https://www.google.com/maps/dir//FreshLook+Aesthetics+Prishtin%C3%AB,+Rruga,+nr.119+Rruga+Ferid+Curri"
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:text-[#C6A96B]"
                >
                  Prishtine - Rr. Ferid Curri (Arberi)
                </a>

                <a
                  href="https://www.google.com/maps/dir//Fresh+Look+Aesthetics+Fush%C3%AB+Kosov%C3%AB,+17+Shkurti"
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:text-[#C6A96B]"
                >
                  Fushe Kosove - Rr. 17 Shkurti
                </a>
              </p>
            </div>

            <a
              href="https://wa.me/38349459659"
              target="_blank"
              rel="noreferrer"
              className="block rounded-full bg-[#25D366] py-3 text-center text-white shadow-md transition hover:bg-[#1ebe5d]"
            >
              Chat on WhatsApp
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-[#e5dccb] bg-[#F7EEDF] p-6 shadow-md"
          >
            <h3 className="mb-4 text-lg font-semibold">Send a Message</h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-[#e5dccb] bg-white p-3"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-xl border border-[#e5dccb] bg-white p-3"
              />

              <textarea
                placeholder="Your Message"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full rounded-xl border border-[#e5dccb] bg-white p-3"
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-full bg-[#C6A96B] py-3 text-white shadow-md transition hover:bg-[#b8965a]"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>

              {success && <p className="text-center text-sm text-green-600">{success}</p>}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
