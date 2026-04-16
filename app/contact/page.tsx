'use client'

import { motion } from 'framer-motion'

export default function ContactPage() {
  return (
    <main className="w-full px-4 py-10 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-playfair mb-3">
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

          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-2">Phone</h3>
            <p className="text-gray-500 text-sm">
              +383 44 000 000
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-gray-500 text-sm">
              info@freshlookaesthetics.com
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-2">Locations</h3>
            <p className="text-gray-500 text-sm">
              Prishtinë<br />
              Fushë Kosovë
            </p>
          </div>

          {/* WHATSAPP CTA */}
          <a
            href="https://wa.me/38344000000"
            target="_blank"
            className="block text-center bg-green-500 text-white py-3 rounded-xl"
          >
            Chat on WhatsApp
          </a>

        </div>

        {/* RIGHT - FORM */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm"
        >
          <h3 className="font-semibold mb-4 text-lg">
            Send a Message
          </h3>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border rounded-xl"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full p-3 border rounded-xl"
            />

            <textarea
              placeholder="Your Message"
              rows={4}
              className="w-full p-3 border rounded-xl"
            />

            <button className="w-full bg-[#C6A96B] text-white py-3 rounded-xl">
              Send Message
            </button>

          </div>
        </motion.div>

      </div>

    </main>
  )
}