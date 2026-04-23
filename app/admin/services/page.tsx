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

type ServiceForm = {
  name: string
  subtitle: string
  description: string
  price: number
  duration: number
  is_on_sale: boolean
  sale_price: number | null
  is_active: boolean
  image_url: string
}

const emptyForm: ServiceForm = {
  name: '',
  subtitle: '',
  description: '',
  price: 0,
  duration: 0,
  is_on_sale: false,
  sale_price: null,
  is_active: true,
  image_url: '',
}

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchServices = async () => {
    const { data, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    setServices((data as Service[]) || [])
  }

  useEffect(() => {
    const initialFetch = window.setTimeout(() => {
      void fetchServices()
    }, 0)

    return () => window.clearTimeout(initialFetch)
  }, [])

  const handleChange = <K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowModal(false)
  }

  const handleImageUpload = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('services')
      .upload(fileName, file)

    if (uploadError) {
      setError(uploadError.message)
      return
    }

    const { data } = supabase.storage
      .from('services')
      .getPublicUrl(fileName)

    handleChange('image_url', data.publicUrl)
  }

  const validate = () => {
    if (!form.name.trim()) return 'Service name is required'
    if (!form.price || form.price <= 0) return 'Price must be greater than 0'
    if (!form.duration || form.duration <= 0) return 'Duration must be greater than 0'
    if (form.is_on_sale && (!form.sale_price || form.sale_price <= 0)) {
      return 'Sale price must be valid'
    }
    return null
  }

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
      name: form.name.trim(),
      subtitle: form.subtitle || null,
      description: form.description || null,
      price: form.price,
      duration: form.duration,
      is_on_sale: form.is_on_sale,
      sale_price: form.is_on_sale ? form.sale_price : null,
      is_active: form.is_active,
      image_url: form.image_url || null,
    }

    const response = editingId
      ? await supabase.from('services').update(payload).eq('id', editingId)
      : await supabase.from('services').insert([payload])

    if (response.error) {
      setError(response.error.message)
    } else {
      setSuccess(editingId ? 'Service updated' : 'Service created')
      resetForm()
      await fetchServices()
    }

    setLoading(false)
  }

  const handleEdit = (service: Service) => {
    setForm({
      name: service.name,
      subtitle: service.subtitle || '',
      description: service.description || '',
      price: service.price,
      duration: service.duration,
      is_on_sale: service.is_on_sale,
      sale_price: service.sale_price,
      is_active: service.is_active,
      image_url: service.image_url || '',
    })
    setEditingId(service.id)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return

    const { error: deleteError } = await supabase.from('services').delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      setSuccess('Service deleted')
      await fetchServices()
    }
  }

  const renderServiceForm = () => (
    <>
      <input
        placeholder="Service Name"
        value={form.name}
        onChange={(e) => handleChange('name', e.target.value)}
        className="w-full border p-3 rounded-xl"
      />

      <input
        placeholder="Subtitle"
        value={form.subtitle}
        onChange={(e) => handleChange('subtitle', e.target.value)}
        className="w-full border p-3 rounded-xl"
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => handleChange('description', e.target.value)}
        className="w-full border p-3 rounded-xl"
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400">EUR</span>
          <input
            type="number"
            value={form.price}
            onChange={(e) => handleChange('price', Number(e.target.value))}
            className="border p-3 pl-14 rounded-xl w-full"
          />
        </div>

        <div className="relative">
          <input
            type="number"
            value={form.duration}
            onChange={(e) => handleChange('duration', Number(e.target.value))}
            className="border p-3 pr-12 rounded-xl w-full"
          />
          <span className="absolute right-3 top-3 text-gray-400">min</span>
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.is_on_sale}
          onChange={(e) => handleChange('is_on_sale', e.target.checked)}
        />
        <span>On Sale</span>
      </label>

      {form.is_on_sale && (
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400">EUR</span>
          <input
            type="number"
            value={form.sale_price ?? 0}
            onChange={(e) => handleChange('sale_price', Number(e.target.value))}
            className="border p-3 pl-14 rounded-xl w-full"
          />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleImageUpload(file)
        }}
      />

      {form.image_url && (
        <img
          src={form.image_url}
          alt={form.name || 'Service preview'}
          className="w-24 h-24 object-cover rounded-xl"
        />
      )}

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => handleChange('is_active', e.target.checked)}
        />
        <span>Active</span>
      </label>
    </>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Services</h1>

      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      <div className="bg-white p-6 rounded-xl shadow mb-8 space-y-4">
        {renderServiceForm()}

        <button onClick={() => void handleSave()} disabled={loading} className="w-full bg-[#C6A96B] text-white py-3 rounded-xl">
          {loading ? 'Saving...' : editingId ? 'Update Service' : 'Add Service'}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl space-y-4">
            <h2 className="text-xl font-semibold">Edit Service</h2>

            {renderServiceForm()}

            <button
              onClick={() => void handleSave()}
              className="w-full bg-[#C6A96B] text-white py-3 rounded-xl"
            >
              Save Changes
            </button>

            <button
              onClick={resetForm}
              className="w-full border py-3 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {services.map((service) => {
          const finalPrice =
            service.is_on_sale && service.sale_price
              ? service.sale_price
              : service.price

          return (
            <div key={service.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
              <div className="flex items-center gap-4">
                {service.image_url && (
                  <img src={service.image_url} alt={service.name} className="w-16 h-16 object-cover rounded-xl" />
                )}

                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.subtitle}</p>
                  <p className="text-sm mt-1">EUR {finalPrice}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEdit(service)} className="px-4 py-2 bg-yellow-400 rounded-lg text-sm">
                  Edit
                </button>

                <button onClick={() => void handleDelete(service.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
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
