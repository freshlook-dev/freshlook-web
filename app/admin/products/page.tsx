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
  is_out_of_stock: boolean
}

type ProductForm = {
  name: string
  description: string
  price: number
  image_url: string
  is_on_sale: boolean
  sale_price: number | null
  is_active: boolean
  is_out_of_stock: boolean
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  is_on_sale: false,
  sale_price: null,
  is_active: true,
  is_out_of_stock: false,
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchProducts = async () => {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    setProducts((data as Product[]) || [])
  }

  useEffect(() => {
    const initialFetch = window.setTimeout(() => {
      void fetchProducts()
    }, 0)

    return () => window.clearTimeout(initialFetch)
  }, [])

  const handleChange = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
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
      .from('products')
      .upload(fileName, file)

    if (uploadError) {
      setError(uploadError.message)
      return
    }

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    handleChange('image_url', data.publicUrl)
  }

  const validate = () => {
    if (!form.name.trim()) return 'Product name required'
    if (!form.price || form.price <= 0) return 'Price must be greater than 0'
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

    const payload: ProductForm = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      image_url: form.image_url || '',
      is_on_sale: form.is_on_sale,
      sale_price: form.is_on_sale ? form.sale_price : null,
      is_active: form.is_active,
      is_out_of_stock: form.is_out_of_stock,
    }

    const response = editingId
      ? await supabase.from('products').update(payload).eq('id', editingId)
      : await supabase.from('products').insert([payload])

    if (response.error) {
      setError(response.error.message)
      setLoading(false)
      return
    }

    setSuccess(editingId ? 'Product updated' : 'Product created')
    resetForm()
    await fetchProducts()
    setLoading(false)
  }

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      is_on_sale: product.is_on_sale,
      sale_price: product.sale_price,
      is_active: product.is_active,
      is_out_of_stock: product.is_out_of_stock ?? false,
    })
    setEditingId(product.id)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setSuccess('Deleted')
    await fetchProducts()
  }

  const renderProductForm = () => (
    <>
      <input
        placeholder="Product Name"
        value={form.name}
        onChange={(e) => handleChange('name', e.target.value)}
        className="w-full border p-3 rounded-xl"
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => handleChange('description', e.target.value)}
        className="w-full border p-3 rounded-xl"
      />

      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">EUR</span>
        <input
          type="number"
          value={form.price}
          onChange={(e) => handleChange('price', Number(e.target.value))}
          className="w-full border p-3 pl-14 rounded-xl"
        />
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
            className="w-full border p-3 pl-14 rounded-xl"
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
          alt={form.name || 'Product preview'}
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

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.is_out_of_stock}
          onChange={(e) => handleChange('is_out_of_stock', e.target.checked)}
        />
        <span>Out of Stock</span>
      </label>
    </>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      <div className="bg-white p-6 rounded-xl shadow mb-8 space-y-4">
        {renderProductForm()}

        <button
          onClick={() => void handleSave()}
          className="w-full bg-[#C6A96B] text-white py-3 rounded-xl"
        >
          {loading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl space-y-4">
            <h2 className="text-xl font-semibold">Edit Product</h2>

            {renderProductForm()}

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
        {products.map((product) => {
          const finalPrice = product.is_on_sale && product.sale_price
            ? product.sale_price
            : product.price

          return (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <img
                  src={product.image_url || '/assets/product1.jpg'}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />

                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p>EUR {finalPrice}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {!product.is_active && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                    {product.is_out_of_stock && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEdit(product)} className="px-4 py-2 bg-yellow-400 rounded-lg text-sm">
                  Edit
                </button>

                <button onClick={() => void handleDelete(product.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
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
