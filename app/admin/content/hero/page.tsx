'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function HeroPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase
      .from('site_images')
      .select('*')
      .in('key', ['hero1', 'hero2', 'hero3'])

    if (data) setItems(data)
  }

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...items]
    updated[index][field] = value
    setItems(updated)
  }

  const handleUpload = async (file: File, index: number) => {
    const key = items[index].key
    const fileName = `${key}-${Date.now()}.jpg`

    await supabase.storage
      .from('site-images')
      .upload(fileName, file, { upsert: true })

    const { data } = supabase.storage
      .from('site-images')
      .getPublicUrl(fileName)

    const updated = [...items]
    updated[index].image_url = data.publicUrl
    setItems(updated)
  }

  const handleSave = async () => {
    setLoading(true)

    for (const item of items) {
      await supabase
        .from('site_images')
        .update({
          title: item.title,
          subtitle: item.subtitle,
          image_url: item.image_url,
        })
        .eq('key', item.key)
    }

    setLoading(false)
    alert('Saved successfully ✅')
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">

      <h1 className="text-xl mb-6 text-center">Hero Content</h1>

      {items.map((item, index) => (
        <div key={item.key} className="mb-6">

          <input
            value={item.title || ''}
            onChange={(e) => handleChange(index, 'title', e.target.value)}
            placeholder="Title"
            className="w-full p-2 border mb-2"
          />

          <input
            value={item.subtitle || ''}
            onChange={(e) => handleChange(index, 'subtitle', e.target.value)}
            placeholder="Subtitle"
            className="w-full p-2 border mb-2"
          />

          <input
            type="file"
            onChange={(e) =>
              e.target.files?.[0] && handleUpload(e.target.files[0], index)
            }
          />

          <div
            className="h-32 mt-2 bg-cover rounded"
            style={{ backgroundImage: `url(${item.image_url})` }}
          />

        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-[#C6A96B] text-white py-3 rounded-xl"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

    </main>
  )
}