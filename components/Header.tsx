'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase/client'
import CartDrawer from '@/components/cart/CartDrawer'
import {
  Home,
  Sparkles,
  Calendar,
  ShoppingBag,
  Info,
  Phone,
  ChevronRight,
} from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [openCart, setOpenCart] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const [user, setUser] = useState<any>(null)
  const [points, setPoints] = useState<number>(0)
  const [role, setRole] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [initials, setInitials] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const router = useRouter()
  const { cart } = useCart()

  const getUser = async () => {
    const { data } = await supabase.auth.getSession()
    const session = data.session

    if (!session) {
      setUser(null)
      setPoints(0)
      setInitials('')
      setRole(null)
      setAvatar(null)
      return
    }

    const user = session.user
    setUser(user)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      setPoints(profile.points || 0)
      setRole(profile.role || null)

      const name = profile.full_name || ''
      const init = name
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()

      setInitials(init || user.email?.[0]?.toUpperCase() || '')

      // ✅ FIXED HERE (no double URL)
      if (profile.avatar_url) {
        setAvatar(profile.avatar_url)
      } else {
        setAvatar(null)
      }
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto'
  }, [isOpen])

  useEffect(() => {
    const handleClick = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const euro = (points * 0.1).toFixed(2)

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const icons: any = {
    Home: <Home size={20} strokeWidth={1.2} />,
    Services: <Sparkles size={20} strokeWidth={1.2} />,
    Shop: <ShoppingBag size={20} strokeWidth={1.2} />,
    About: <Info size={20} strokeWidth={1.2} />,
    Contact: <Phone size={20} strokeWidth={1.2} />,
  }

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur shadow-sm'
            : 'bg-white/70 backdrop-blur'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

          <Link href="/">
            <Image src="/assets/logo.png" alt="Fresh Look" width={140} height={40} />
          </Link>

          <nav className="hidden md:flex gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={
                    pathname === link.href
                      ? 'text-[#C6A96B]'
                      : 'text-black hover:text-[#C6A96B]'
                  }
                >
                  {link.name}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">

            {/* CART */}
            <button onClick={() => setOpenCart(true)} className="relative">
              🛒
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C6A96B] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-semibold border border-[#e5dccb] bg-gray-100"
              >
                {user ? (
                  avatar ? (
                    <img
                      src={`${avatar}?t=${Date.now()}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">{initials}</span>
                  )
                ) : (
                  '👤'
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl p-4 flex flex-col gap-2 z-[9999]">

                  {!user ? (
                    <>
                      <button
                        onClick={() => router.push('/login')}
                        className="w-full text-center px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                      >
                        Login
                      </button>

                      <button
                        onClick={() => router.push('/signup')}
                        className="w-full text-center px-4 py-2 rounded-lg bg-[#C6A96B] text-white hover:opacity-90 transition"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-center pb-3 border-b">
                        <p className="text-xs text-gray-400">Fresh Points</p>
                        <p className="text-lg font-semibold text-[#C6A96B]">
                          {points} pts
                        </p>
                        <p className="text-xs text-gray-400">
                          (€{euro})
                        </p>
                      </div>

                      <button
                        onClick={() => router.push('/profile')}
                        className="w-full text-center px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                      >
                        My Profile
                      </button>

                      {(role === 'owner' || role === 'manager') && (
                        <button
                          onClick={() => router.push('/admin')}
                          className="w-full text-center px-4 py-2 rounded-lg text-[#C6A96B] font-semibold hover:bg-gray-100 transition"
                        >
                          Admin Panel
                        </button>
                      )}

                      <button
                        onClick={() => router.push('/settings')}
                        className="w-full text-center px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                      >
                        Settings
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full text-center px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </>
                  )}

                </div>
              )}
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
              ☰
            </button>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={openCart} onClose={() => setOpenCart(false)} />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm z-[9999]
              bg-gradient-to-b from-white via-neutral-50 to-neutral-100
              backdrop-blur-xl shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center px-6 py-6 border-b border-neutral-200">
                <Image src="/assets/logo.png" alt="Fresh Look" width={100} height={30} />
                <button onClick={() => setIsOpen(false)} className="text-2xl">
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-6 mt-10 px-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between text-lg font-medium group ${
                        pathname === link.href
                          ? 'text-[#C6A96B]'
                          : 'text-black hover:text-[#C6A96B]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-gray-500 group-hover:text-[#C6A96B] transition">
                          {icons[link.name]}
                        </span>
                        {link.name}
                      </span>

                      <ChevronRight size={18} className="text-gray-300 group-hover:text-[#C6A96B]" />
                    </Link>

                    <div className="h-px bg-neutral-200 mt-4" />
                  </motion.div>
                ))}
              </div>

<div className="px-6 mt-8 space-y-3">

  <button
    onClick={() => {
      setIsOpen(false)
      router.push('/book')
    }}
    className="w-full bg-[#C6A96B] text-white py-3 rounded-xl"
  >
    Book Appointment
  </button>

  {user && (
    <button
      onClick={() => {
        setIsOpen(false)
        router.push('/profile/points')
      }}
      className="w-full border py-3 rounded-xl"
    >
      Use Points
    </button>
  )}

  {user && (
    <div className="border p-3 rounded-xl text-sm text-gray-500">
      No upcoming appointments
    </div>
  )}

</div>

              <div className="flex-1" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}