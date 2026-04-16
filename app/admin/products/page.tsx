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

  // FETCH
  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setProducts(data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // CHANGE
  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // SAVE
  const handleSave = async () => {
    setLoading(true)

    if (editingId) {
      await supabase.from('products').update(form).eq('id', editingId)
    } else {
      await supabase.from('products').insert([form])
    }

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
    setLoading(false)
    fetchProducts()
  }

  // EDIT
  const handleEdit = (product: Product) => {
    setForm(product)
    setEditingId(product.id)
  }

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 space-y-4">

        <input
          placeholder="Product Name"
          value={form.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <textarea
          placeholder="Description"
          value={form.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="Image URL"
          value={form.image_url || ''}
          onChange={(e) => handleChange('image_url', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price || 0}
          onChange={(e) => handleChange('price', Number(e.target.value))}
          className="w-full border p-3 rounded-xl"
        />

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
            className="w-full border p-3 rounded-xl"
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
          {editingId ? 'Update Product' : 'Add Product'}
        </button>
      </div>

      {/* LIST */}
      <div className="grid gap-4">
        {products.map(product => {
          const finalPrice = product.is_on_sale && product.sale_price
            ? product.sale_price
            : product.price

          const discount = product.is_on_sale && product.sale_price
            ? Math.round(((product.price - product.sale_price) / product.price) * 100)
            : 0

          return (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">

              <div className="flex gap-4 items-center">
                <img
                  src={product.image_url || '/assets/product1.jpg'}
                  className="w-16 h-16 object-cover rounded-lg"
                />

                <div>
                  <h3 className="font-semibold">{product.name}</h3>

                  <p className="text-sm mt-1">
                    {product.is_on_sale ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">
                          €{product.price}
                        </span>
                        <span className="text-green-600 font-semibold">
                          €{finalPrice}
                        </span>
                        <span className="text-xs ml-2 text-red-500">
                          -{discount}%
                        </span>
                      </>
                    ) : (
                      <>€{product.price}</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="px-4 py-2 bg-yellow-400 rounded-lg text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(product.id)}
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