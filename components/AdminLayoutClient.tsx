'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Services', href: '/admin/services' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Promos', href: '/admin/promos' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Messages', href: '/admin/messages' },
    { name: 'Content', href: '/admin/content' },
    { name: 'Appointments', href: '/admin/appointments' },
  ]

  return (
    <div className="flex min-h-screen bg-[#f8f8f8]">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-[#C6A96B] text-white p-6 flex-col">
        <h2 className="text-xl font-semibold mb-8">Admin Panel</h2>

        <nav className="flex flex-col gap-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition ${
                pathname === item.href
                  ? 'bg-white text-[#C6A96B] px-3 py-2 rounded-lg font-semibold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/20">
          <Link
            href="/"
            className="block text-sm bg-white text-[#C6A96B] text-center py-2 rounded-xl font-medium"
          >
            ← Back to Website
          </Link>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#C6A96B] text-white flex items-center justify-between px-4 h-14 shadow">
        <h2 className="font-semibold text-sm">Admin Panel</h2>

        <button onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-[#C6A96B]">Admin Panel</h2>

          <button onClick={() => setOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-3 p-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`transition ${
                pathname === item.href
                  ? 'text-[#C6A96B] font-semibold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-4 p-4 border-t">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block text-center bg-[#C6A96B] text-white py-2 rounded-xl text-sm font-medium"
          >
            ← Back to Website
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <main className="flex-1 p-4 md:p-8 mt-14 md:mt-0">
        {children}
      </main>

    </div>
  )
}