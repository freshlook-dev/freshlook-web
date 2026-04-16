'use client'

import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <main className="w-full overflow-x-hidden">

      {/* HERO */}
      <section className="h-[50vh] flex items-center justify-center text-center px-4 bg-[url('/assets/hero1.jpg')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black/50" />

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
        <div className="h-72 sm:h-96 bg-[url('/assets/product1.jpg')] bg-cover bg-center rounded-2xl" />

        {/* TEXT */}
        <div>
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
        </div>
      </section>

      {/* VALUES / TRUST */}
      <section className="py-16 px-4 bg-neutral-50">
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
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl shadow-sm text-center"
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
        <div>
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
        </div>

        {/* IMAGE */}
        <div className="h-72 sm:h-96 bg-[url('/assets/hero2.jpg')] bg-cover bg-center rounded-2xl" />
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-[#C6A96B] text-white px-4">
        <h2 className="text-2xl sm:text-3xl font-playfair mb-6">
          Ready to Transform Your Look?
        </h2>

        <a
          href="/book"
          className="bg-white text-black px-6 py-3 rounded-xl inline-block"
        >
          Book Your Appointment
        </a>
      </section>

    </main>
  )
}