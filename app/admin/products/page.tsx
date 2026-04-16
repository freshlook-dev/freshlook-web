'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  is_on_sale: boolean
  sale_price: number | null
  is_active: boolean
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_on_sale: false,
    sale_price: null,
    is_active: true,
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      return
    }

    setProducts(data || [])
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: 0,
      image_url: '',
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
      .from('products')
      .upload(fileName, file)

    if (error) {
      setError(error.message)
      return
    }

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    handleChange('image_url', data.publicUrl)
  }

  const validate = () => {
    if (!form.name) return 'Product name required'
    if (!form.price || form.price <= 0) return 'Price must be > 0'
    if (form.is_on_sale && (!form.sale_price || form.sale_price <= 0)) {
      return 'Invalid sale price'
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
      name: form.name,
      description: form.description || '',
      price: form.price,
      image_url: form.image_url || '',
      is_on_sale: form.is_on_sale,
      sale_price: form.is_on_sale ? form.sale_price : null,
      is_active: form.is_active,
    }

    let res

    if (editingId) {
      res = await supabase.from('products').update(payload).eq('id', editingId)
    } else {
      res = await supabase.from('products').insert([payload])
    }

    if (res.error) {
      setError(res.error.message)
    } else {
      setSuccess(editingId ? 'Product updated' : 'Product created')
      resetForm()
      fetchProducts()
    }

    setLoading(false)
  }

  const handleEdit = (product: Product) => {
    setForm(product)
    setEditingId(product.id)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) setError(error.message)
    else {
      setSuccess('Deleted')
      fetchProducts()
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 space-y-4">

        <input placeholder="Product Name" value={form.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full border p-3 rounded-xl" />

        <textarea placeholder="Description" value={form.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="w-full border p-3 rounded-xl" />

        {/* PRICE */}
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400">€</span>
          <input type="number" value={form.price ?? 0} onChange={(e) => handleChange('price', Number(e.target.value))} className="w-full border p-3 pl-8 rounded-xl" />
        </div>

        {/* SALE */}
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={form.is_on_sale || false} onChange={(e) => handleChange('is_on_sale', e.target.checked)} />
          <span>On Sale</span>
        </div>

        {form.is_on_sale && (
          <div className="relative">
            <input type="number" value={form.sale_price ?? 0} onChange={(e) => handleChange('sale_price', Number(e.target.value))} className="w-full border p-3 pr-10 rounded-xl" />
            <span className="absolute right-3 top-3 text-gray-400">€</span>
          </div>
        )}

        {/* IMAGE */}
        <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />

        <div className="flex items-center gap-3">
          <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => handleChange('is_active', e.target.checked)} />
          <span>Active</span>
        </div>

        <button onClick={handleSave} className="w-full bg-[#C6A96B] text-white py-3 rounded-xl">
          {loading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl space-y-4">

      <h2 className="text-xl font-semibold">Edit Product</h2>

      {/* NAME */}
      <input
        placeholder="Product Name"
        value={form.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}
        className="w-full border p-3 rounded-xl"
      />

      {/* DESCRIPTION */}
      <textarea
        placeholder="Description"
        value={form.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        className="w-full border p-3 rounded-xl"
      />

      {/* PRICE */}
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">€</span>
        <input
          type="number"
          value={form.price ?? 0}
          onChange={(e) => handleChange('price', Number(e.target.value))}
          className="border p-3 pl-8 rounded-xl w-full"
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

      {/* IMAGE PREVIEW */}
      {form.image_url && (
        <img
          src={form.image_url}
          className="w-24 h-24 object-cover rounded-xl"
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
        {products.map(product => {
          const finalPrice = product.is_on_sale && product.sale_price
            ? product.sale_price
            : product.price

          return (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">

              <div className="flex gap-4 items-center">
                <img src={product.image_url || '/assets/product1.jpg'} className="w-16 h-16 object-cover rounded-lg" />

                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p>€{finalPrice}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEdit(product)} className="px-4 py-2 bg-yellow-400 rounded-lg text-sm">
                  Edit
                </button>

                <button onClick={() => handleDelete(product.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
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