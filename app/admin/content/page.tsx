'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Slide = {
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  image_desktop: string
  image_mobile: string
}

export default function ContentPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentPreview, setCurrentPreview] = useState(0)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // FETCH
  const fetchContent = async () => {
    const { data } = await supabase
      .from('content')
      .select('*')
      .eq('key', 'hero')
      .single()

    if (data?.value?.slides) {
      setSlides(data.value.slides)
    } else {
      // fallback empty slide
      setSlides([emptySlide()])
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  const emptySlide = (): Slide => ({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
    image_desktop: '',
    image_mobile: '',
  })

  const updateSlide = (index: number, key: keyof Slide, value: any) => {
    const updated = [...slides]
    updated[index][key] = value
    setSlides(updated)
  }

  const addSlide = () => {
    setSlides([...slides, emptySlide()])
  }

  const removeSlide = (index: number) => {
    const updated = slides.filter((_, i) => i !== index)
    setSlides(updated.length ? updated : [emptySlide()])
  }

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const updated = [...slides]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= slides.length) return

    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp

    setSlides(updated)
  }

  // IMAGE UPLOAD
  const handleImageUpload = async (
    file: File,
    index: number,
    type: 'desktop' | 'mobile'
  ) => {
    const fileName = `hero-${type}-${Date.now()}`

    const { error } = await supabase.storage
      .from('hero')
      .upload(fileName, file)

    if (error) {
      setError(error.message)
      return
    }

    const { data } = supabase.storage
      .from('hero')
      .getPublicUrl(fileName)

    updateSlide(
      index,
      type === 'desktop' ? 'image_desktop' : 'image_mobile',
      data.publicUrl
    )
  }

  // SAVE
  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error } = await supabase
      .from('content')
      .upsert(
        {
          key: 'hero',
          value: { slides },
        },
        { onConflict: 'key' }
      )

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Hero updated successfully')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <h1 className="text-2xl font-semibold mb-6">Hero Slides</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      {/* PREVIEW */}
      {slides[currentPreview] && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow relative h-60 bg-black text-white flex items-center justify-center text-center">
          <img
            src={
              slides[currentPreview].image_desktop ||
              '/assets/product1.jpg'
            }
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="relative z-10 px-4">
            <h2 className="text-xl font-playfair">
              {slides[currentPreview].title || 'Preview Title'}
            </h2>
            <p className="text-sm mt-2">
              {slides[currentPreview].subtitle || 'Preview subtitle'}
            </p>
          </div>
        </div>
      )}

      {/* SLIDES */}
      <div className="space-y-6">
        {slides.map((slide, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow space-y-3">

            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Slide {index + 1}</h2>

              <div className="flex gap-2">
                <button onClick={() => moveSlide(index, 'up')}>⬆️</button>
                <button onClick={() => moveSlide(index, 'down')}>⬇️</button>
                <button onClick={() => removeSlide(index)}>❌</button>
              </div>
            </div>

            <input
              placeholder="Title"
              value={slide.title || ''}
              onChange={(e) => updateSlide(index, 'title', e.target.value)}
              className="w-full border p-2 rounded"
            />

            <textarea
              placeholder="Subtitle"
              value={slide.subtitle || ''}
              onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              placeholder="CTA Text"
              value={slide.cta_text || ''}
              onChange={(e) => updateSlide(index, 'cta_text', e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              placeholder="CTA Link"
              value={slide.cta_link || ''}
              onChange={(e) => updateSlide(index, 'cta_link', e.target.value)}
              className="w-full border p-2 rounded"
            />

            {/* DESKTOP IMAGE */}
            <div>
              <label className="text-sm">Desktop Image</label>
              <input
                type="file"
                onChange={(e) =>
                  e.target.files &&
                  handleImageUpload(e.target.files[0], index, 'desktop')
                }
              />
              {slide.image_desktop && (
                <img src={slide.image_desktop} className="h-24 mt-2 rounded" />
              )}
            </div>

            {/* MOBILE IMAGE */}
            <div>
              <label className="text-sm">Mobile Image</label>
              <input
                type="file"
                onChange={(e) =>
                  e.target.files &&
                  handleImageUpload(e.target.files[0], index, 'mobile')
                }
              />
              {slide.image_mobile && (
                <img src={slide.image_mobile} className="h-24 mt-2 rounded" />
              )}
            </div>

            <button
              onClick={() => setCurrentPreview(index)}
              className="text-xs text-blue-500"
            >
              Preview this slide
            </button>
          </div>
        ))}
      </div>

      {/* ADD SLIDE */}
      <button
        onClick={addSlide}
        className="mt-6 w-full border py-3 rounded-xl"
      >
        + Add Slide
      </button>

      {/* SAVE */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-4 w-full bg-[#C6A96B] text-white py-3 rounded-xl"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

    </div>
  )
}