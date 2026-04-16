'use client'

import Link from 'next/link'

export default function ContentPage() {
  const sections = [
    { name: 'Hero Section', href: '/admin/content/hero' },
    { name: 'Services Section', href: '/admin/content/services' },
    { name: 'Products Section', href: '/admin/content/products' },
  ]

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">

      <h1 className="text-2xl font-playfair mb-8 text-center">
        Manage Website Content
      </h1>

      <div className="grid gap-4">
        {sections.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="bg-white p-6 rounded-xl shadow text-center hover:shadow-md transition"
          >
            {item.name}
          </Link>
        ))}
      </div>

    </main>
  )
}