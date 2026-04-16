'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Promo = {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  expires_at: string | null
  is_active: boolean
}

export default function PromoPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<Partial<Promo>>({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    expires_at: '',
    is_active: true,
  })

  // FETCH
  const fetchPromos = async () => {
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setPromos(data)
  }

  useEffect(() => {
    fetchPromos()
  }, [])

  // CHANGE
  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // SAVE
  const handleSave = async () => {
    setLoading(true)

    if (editingId) {
      await supabase.from('promo_codes').update(form).eq('id', editingId)
    } else {
      await supabase.from('promo_codes').insert([form])
    }

    setForm({
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      expires_at: '',
      is_active: true,
    })

    setEditingId(null)
    setLoading(false)
    fetchPromos()
  }

  // EDIT
  const handleEdit = (promo: Promo) => {
    setForm(promo)
    setEditingId(promo.id)
  }

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code?')) return
    await supabase.from('promo_codes').delete().eq('id', id)
    fetchPromos()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Promo Codes</h1>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 space-y-4">

        <input
          placeholder="CODE (e.g. SUMMER10)"
          value={form.code || ''}
          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
          className="w-full border p-3 rounded-xl"
        />

        <select
          value={form.discount_type}
          onChange={(e) => handleChange('discount_type', e.target.value)}
          className="w-full border p-3 rounded-xl"
        >
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed (€)</option>
        </select>

        <input
          type="number"
          placeholder="Discount Value"
          value={form.discount_value || 0}
          onChange={(e) => handleChange('discount_value', Number(e.target.value))}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="date"
          value={form.expires_at || ''}
          onChange={(e) => handleChange('expires_at', e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

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
          {editingId ? 'Update Promo' : 'Create Promo'}
        </button>
      </div>

      {/* LIST */}
      <div className="grid gap-4">
        {promos.map(promo => (
          <div key={promo.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">

            <div>
              <h3 className="font-semibold">{promo.code}</h3>

              <p className="text-sm text-gray-500">
                {promo.discount_type === 'percentage'
                  ? `${promo.discount_value}% OFF`
                  : `€${promo.discount_value} OFF`}
              </p>

              {promo.expires_at && (
                <p className="text-xs text-gray-400">
                  Expires: {promo.expires_at}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(promo)}
                className="px-4 py-2 bg-yellow-400 rounded-lg text-sm"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(promo.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
              >
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}