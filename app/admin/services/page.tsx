'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Service = {
  id: string
  name: string
  subtitle: string | null
  description: string | null
  price: number
  duration: number
  is_on_sale: boolean
  sale_price: number | null
  is_active: boolean
  image_url?: string | null
}

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
  const [showModal, setShowModal] = useState(false)

  // FETCH
  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      return
    }

    setServices(data || [])
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
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
    setShowModal(false)
  }

  // IMAGE UPLOAD
  const handleImageUpload = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('services')
      .upload(fileName, file)

    if (error) {
      setError(error.message)
      return
    }

    const { data } = supabase.storage
      .from('services')
      .getPublicUrl(fileName)

    handleChange('image_url', data.publicUrl)
  }

  // VALIDATION
  const validate = () => {
    if (!form.name || form.name.trim() === '') return 'Service name is required'
    if (!form.price || form.price <= 0) return 'Price must be greater than 0'
    if (!form.duration || form.duration <= 0) return 'Duration must be greater than 0'
    if (form.is_on_sale && (!form.sale_price || form.sale_price <= 0)) {
      return 'Sale price must be valid'
    }
    return null
  }

  // SAVE
  const handleSave = async () => {
    setError(null)
    setSuccess(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    const payload = {
      name: form.name,
      subtitle: form.subtitle || null,
      description: form.description || null,
      price: form.price,
      duration: form.duration,
      is_on_sale: form.is_on_sale,
      sale_price: form.is_on_sale ? form.sale_price : null,
      is_active: form.is_active,
      image_url: form.image_url || null,
    }

    let res

    if (editingId) {
      res = await supabase.from('services').update(payload).eq('id', editingId)
    } else {
      res = await supabase.from('services').insert([payload])
    }

    if (res.error) {
      setError(res.error.message)
    } else {
      setSuccess(editingId ? 'Service updated' : 'Service created')
      resetForm()
      fetchServices()
    }

    setLoading(false)
  }

  // EDIT (OPEN MODAL)
  const handleEdit = (service: Service) => {
    setForm(service)
    setEditingId(service.id)
    setShowModal(true)
  }

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return

    const { error } = await supabase.from('services').delete().eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Service deleted')
      fetchServices()
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Services</h1>

      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 space-y-4">

        <input placeholder="Service Name" value={form.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full border p-3 rounded-xl" />

        <input placeholder="Subtitle" value={form.subtitle || ''} onChange={(e) => handleChange('subtitle', e.target.value)} className="w-full border p-3 rounded-xl" />

        <textarea placeholder="Description" value={form.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="w-full border p-3 rounded-xl" />

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">€</span>
            <input type="number" value={form.price ?? 0} onChange={(e) => handleChange('price', Number(e.target.value))} className="border p-3 pl-8 rounded-xl w-full" />
          </div>

          <div className="relative">
            <input type="number" value={form.duration ?? 0} onChange={(e) => handleChange('duration', Number(e.target.value))} className="border p-3 pr-12 rounded-xl w-full" />
            <span className="absolute right-3 top-3 text-gray-400">min</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" checked={form.is_on_sale || false} onChange={(e) => handleChange('is_on_sale', e.target.checked)} />
          <span>On Sale</span>
        </div>

        {form.is_on_sale && (
          <div className="relative">
            <input type="number" value={form.sale_price ?? 0} onChange={(e) => handleChange('sale_price', Number(e.target.value))} className="border p-3 pr-10 rounded-xl w-full" />
            <span className="absolute right-3 top-3 text-gray-400">€</span>
          </div>
        )}

        {/* IMAGE */}
        <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />

        <div className="flex items-center gap-3">
          <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => handleChange('is_active', e.target.checked)} />
          <span>Active</span>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full bg-[#C6A96B] text-white py-3 rounded-xl">
          {loading ? 'Saving...' : editingId ? 'Update Service' : 'Add Service'}
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl space-y-4">

      <h2 className="text-xl font-semibold">Edit Service</h2>

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
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400">€</span>
          <input
            type="number"
            value={form.price ?? 0}
            onChange={(e) => handleChange('price', Number(e.target.value))}
            className="border p-3 pl-8 rounded-xl w-full"
          />
        </div>

        <div className="relative">
          <input
            type="number"
            value={form.duration ?? 0}
            onChange={(e) => handleChange('duration', Number(e.target.value))}
            className="border p-3 pr-12 rounded-xl w-full"
          />
          <span className="absolute right-3 top-3 text-gray-400">min</span>
        </div>
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
        <div className="relative">
          <input
            type="number"
            value={form.sale_price ?? 0}
            onChange={(e) => handleChange('sale_price', Number(e.target.value))}
            className="border p-3 pr-10 rounded-xl w-full"
          />
          <span className="absolute right-3 top-3 text-gray-400">%</span>
        </div>
      )}

      {/* IMAGE */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          e.target.files && handleImageUpload(e.target.files[0])
        }
      />

      {/* ACTIVE */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.is_active ?? true}
          onChange={(e) => handleChange('is_active', e.target.checked)}
        />
        <span>Active</span>
      </div>

      {/* BUTTONS */}
      <button
        onClick={handleSave}
        className="w-full bg-[#C6A96B] text-white py-3 rounded-xl"
      >
        Save Changes
      </button>

      <button
        onClick={() => setShowModal(false)}
        className="w-full border py-3 rounded-xl"
      >
        Cancel
      </button>

    </div>
  </div>
)}

      {/* LIST */}
      <div className="grid gap-4">
        {services.map(service => {
          const finalPrice =
            service.is_on_sale && service.sale_price
              ? service.sale_price
              : service.price

          return (
            <div key={service.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">

              <div className="flex items-center gap-4">
                {service.image_url && (
                  <img src={service.image_url} className="w-16 h-16 object-cover rounded-xl" />
                )}

                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.subtitle}</p>
                  <p className="text-sm mt-1">€{finalPrice}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEdit(service)} className="px-4 py-2 bg-yellow-400 rounded-lg text-sm">
                  Edit
                </button>

                <button onClick={() => handleDelete(service.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
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