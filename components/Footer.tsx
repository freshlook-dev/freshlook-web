'use client'

import { Phone, Mail, MapPin } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function Footer() {
  const router = useRouter()

  return (
    <footer className="bg-[#1A1A1A] text-white">

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <div className="text-xl font-playfair mb-4">
            Fresh Look Aesthetics
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Get Fresh
          </p>

          <div className="flex items-center gap-4 mt-4">
            <a
              href="https://www.instagram.com/freshlook.aesthetics"
              target="_blank"
              className="hover:text-[#C6A96B] transition"
            >
              <FaInstagram size={20} />
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="font-semibold mb-4 text-[#C6A96B]">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="hover:text-white cursor-pointer" onClick={() => router.push('/')}>Home</li>
            <li className="hover:text-white cursor-pointer" onClick={() => router.push('/services')}>Services</li>
            <li className="hover:text-[#C6A96B] font-medium cursor-pointer" onClick={() => router.push('/book')}>Book Appointment</li>
            <li className="hover:text-white cursor-pointer" onClick={() => router.push('/shop')}>Shop</li>
            <li className="hover:text-white cursor-pointer" onClick={() => router.push('/about')}>About</li>
            <li className="hover:text-white cursor-pointer" onClick={() => router.push('/contact')}>Contact</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-semibold mb-4 text-[#C6A96B]">Contact</h3>

          <div className="space-y-3 text-sm text-gray-400">

            <a href="tel:+38344459659" className="flex items-center gap-2 hover:text-white">
              <Phone size={16} /> +383 44 459 659
            </a>

            <a href="tel:+38349459659" className="flex items-center gap-2 hover:text-white">
              <Phone size={16} /> +383 49 459 659 (WhatsApp)
            </a>

            <a href="tel:+38338721771" className="flex items-center gap-2 hover:text-white">
              <Phone size={16} /> +383 38 721 771
            </a>

            <a href="mailto:info@freshlook-ks.com" className="flex items-center gap-2 hover:text-white">
              <Mail size={16} /> info@freshlook-ks.com
            </a>

            <p className="text-gray-500 text-xs mt-2">
              Mon – Sat: 10:00 – 20:00
            </p>

          </div>
        </div>

        {/* LOCATIONS */}
        <div>
          <h3 className="font-semibold mb-4 text-[#C6A96B]">Locations</h3>

          <div className="space-y-4 text-sm text-gray-400">

            <a
              href="https://www.google.com/maps/dir//FreshLook+Aesthetics+Prishtin%C3%AB,+Rruga,+nr.119+Rruga+Ferid+Curri,+Prishtin%C3%AB+10000/@42.6599847,21.1409745,13z"
              target="_blank"
              className="flex items-start gap-2 hover:text-white"
            >
              <MapPin size={16} className="mt-1" />
              Prishtinë, Rr. Ferid Curri (Arbëri)
            </a>

            <a
              href="https://www.google.com/maps/dir//Fresh+Look+Aesthetics+Fush%C3%AB+Kosov%C3%AB,+17+Shkurti,+Fush%C3%AB-Kosov%C3%AB+11000/@42.6599847,21.1409745,13z"
              target="_blank"
              className="flex items-start gap-2 hover:text-white"
            >
              <MapPin size={16} className="mt-1" />
              Fushë Kosovë, Rr. 17 Shkurti
            </a>

          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10 text-center text-xs text-gray-500 py-6 px-4 flex flex-col sm:flex-row justify-between items-center gap-2">

        <span>© 2026 Fresh Look Aesthetics L.L.C. All rights reserved.</span>

        <div className="flex gap-4">
          <span
            onClick={() => router.push('/privacy-policy')}
            className="hover:text-white cursor-pointer"
          >
            Privacy Policy
          </span>
          <span
            onClick={() => router.push('/terms')}
            className="hover:text-white cursor-pointer"
          >
            Terms of Service
          </span>
        </div>

      </div>

    </footer>
  )
}