'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Service = {
  id: string
  name: string
  subtitle: string
  description: string
  price: number
  duration: number
  is_on_sale: boolean
  sale_price: number | null
  is_active: boolean
}

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<Partial<Service>>({
    name: '',
    subtitle: '',
    description: '',
    price: 0,
    duration: 0,
    is_on_sale: false,
    sale_price: null,
    is_active: true,
  })

  const [editingId, setEditingId] = useState<string | null>(null)

  // FETCH SERVICES
  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false })
    if (data) setServices(data)
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // HANDLE INPUT
  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // SAVE (CREATE OR UPDATE)
  const handleSave = async () => {
    setLoading(true)

    if (editingId) {
      await supabase.from('services').update(form).eq('id', editingId)
    } else {
      await supabase.from('services').insert([form])
    }

    setForm({
      name: '',
      subtitle: '',
      description: '',
      price: 0,
      duration: 0,
      is_on_sale: false,
      sale_price: null,
      is_active: true,
    })

    setEditingId(null)
    setLoading(false)
    fetchServices()
  }

  // EDIT
  const handleEdit = (service: Service) => {
    setForm(service)
    setEditingId(service.id)
  }

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    fetchServices()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Services</h1>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 space-y-4">

        <input
          placeholder="Service Name"
          value={form.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="Subtitle"
          value={form.subtitle || ''}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <textarea
          placeholder="Description"
          value={form.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Price"
            value={form.price || 0}
            onChange={(e) => handleChange('price', Number(e.target.value))}
            className="border p-3 rounded-xl"
          />

          <input
            type="number"
            placeholder="Duration (min)"
            value={form.duration || 0}
            onChange={(e) => handleChange('duration', Number(e.target.value))}
            className="border p-3 rounded-xl"
          />
        </div>

        {/* SALE */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.is_on_sale || false}
            onChange={(e) => handleChange('is_on_sale', e.target.checked)}
          />
          <span>On Sale</span>
        </div>

        {form.is_on_sale && (
          <input
            type="number"
            placeholder="Sale Price"
            value={form.sale_price || 0}
            onChange={(e) => handleChange('sale_price', Number(e.target.value))}
            className="border p-3 rounded-xl w-full"
          />
        )}

        {/* ACTIVE */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.is_active ?? true}
            onChange={(e) => handleChange('is_active', e.target.checked)}
          />
          <span>Active</span>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#C6A96B] text-white py-3 rounded-xl"
        >
          {editingId ? 'Update Service' : 'Add Service'}
        </button>
      </div>

      {/* LIST */}
      <div className="grid gap-4">
        {services.map(service => {
          const finalPrice = service.is_on_sale && service.sale_price
            ? service.sale_price
            : service.price

          const discount = service.is_on_sale && service.sale_price
            ? Math.round(((service.price - service.sale_price) / service.price) * 100)
            : 0

          return (
            <div key={service.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">

              <div>
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-gray-500">{service.subtitle}</p>

                <p className="text-sm mt-1">
                  {service.is_on_sale ? (
                    <>
                      <span className="line-through text-gray-400 mr-2">
                        €{service.price}
                      </span>
                      <span className="text-green-600 font-semibold">
                        €{finalPrice}
                      </span>
                      <span className="text-xs ml-2 text-red-500">
                        -{discount}%
                      </span>
                    </>
                  ) : (
                    <>€{service.price}</>
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="px-4 py-2 bg-yellow-400 rounded-lg text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(service.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
                >
                  Delete
                </button>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}