'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function AboutPage() {
  const router = useRouter()

  return (
    <main className="w-full overflow-x-hidden bg-[#F7EEDF]">

      {/* HERO */}
      <section className="h-[50vh] flex items-center justify-center text-center px-4 bg-[url('/assets/hero1.jpg')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/70" />

        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair text-white mb-4">
            About Fresh Look Aesthetics
          </h1>
          <p className="text-white/80 text-sm sm:text-base">
            Where beauty meets precision and confidence begins
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="py-16 px-4 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        {/* IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="h-72 sm:h-96 bg-[url('/assets/product1.jpg')] bg-cover bg-center rounded-3xl shadow-lg"
        />

        {/* TEXT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl sm:text-3xl font-playfair mb-4">
            Our Story
          </h2>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
            Fresh Look Aesthetics was created with a passion for helping clients feel confident in their own skin.
            We combine modern aesthetic techniques with a personalized approach to deliver natural and elegant results.
          </p>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Our focus is not just beauty—but confidence, comfort, and a premium experience from the moment you walk in.
          </p>
        </motion.div>
      </section>

      {/* VALUES */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-playfair mb-2">
            Why Choose Us
          </h2>
          <p className="text-gray-500 text-sm">
            Excellence in every detail
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              title: 'Certified Experts',
              desc: 'Highly trained professionals delivering safe and precise treatments',
            },
            {
              title: 'Premium Products',
              desc: 'Only top-quality products for long-lasting results',
            },
            {
              title: 'Personalized Care',
              desc: 'Every client receives a tailored treatment plan',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className="bg-[#F7EEDF] border border-[#e5dccb] p-6 rounded-3xl shadow-md text-center"
            >
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LOCATIONS */}
      <section className="py-16 px-4 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        {/* TEXT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl sm:text-3xl font-playfair mb-4">
            Our Locations
          </h2>

          <p className="text-gray-600 text-sm sm:text-base mb-4">
            We proudly serve our clients in multiple locations, offering the same premium experience everywhere.
          </p>

          <ul className="text-gray-600 text-sm space-y-2">
            <li>• Prishtinë</li>
            <li>• Fushë Kosovë</li>
          </ul>
        </motion.div>

        {/* IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="h-72 sm:h-96 bg-[url('/assets/hero2.jpg')] bg-cover bg-center rounded-3xl shadow-lg"
        />
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-[#C6A96B] text-white px-4">
        <h2 className="text-2xl sm:text-3xl font-playfair mb-6">
          Ready to Transform Your Look?
        </h2>

        <button
          onClick={() => router.push('/book')}
          className="bg-white text-black px-8 py-3 rounded-full shadow-md hover:scale-105 transition"
        >
          Book Your Appointment
        </button>
      </section>

    </main>
  )
}