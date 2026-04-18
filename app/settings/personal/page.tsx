'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function PersonalPage() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
  })

  const [modal, setModal] = useState<null | 'name' | 'phone'>(null)
  const [tempValue, setTempValue] = useState('')

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)

    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, avatar_url')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || '',
      })
    }
  }

  const openModal = (type: 'name' | 'phone') => {
    setModal(type)
    setTempValue(type === 'name' ? profile.full_name : profile.phone)
  }

  const handleSave = async () => {
    if (!user || !modal) return

    setLoading(true)

    const updates =
      modal === 'name'
        ? { full_name: tempValue }
        : { phone: tempValue }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setModal(null)
    fetchUser()
  }

  // 🔥 UPLOAD AVATAR
  const handleUpload = async (e: any) => {
    try {
      const file = e.target.files[0]
      if (!file || !user) return

      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const publicUrl = data.publicUrl

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      setProfile((prev) => ({
        ...prev,
        avatar_url: publicUrl,
      }))
    } catch (err: any) {
      alert(err.message)
    }

    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-[#F7EEDF] p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* BACK */}
        <button
          onClick={() => router.push('/settings')}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to Settings
        </button>

        <h1 className="text-2xl font-semibold">
          Personal Information
        </h1>

        {/* AVATAR */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border border-[#e5dccb] shadow-md bg-white flex items-center justify-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm">
                No Photo
              </span>
            )}
          </div>

          <label className="text-sm text-[#C6A96B] cursor-pointer">
            {uploading ? 'Uploading...' : 'Change Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* CARD */}
        <div className="bg-[#F7EEDF] border border-[#e5dccb] rounded-3xl shadow-md overflow-hidden">

          {/* NAME */}
          <button
            onClick={() => openModal('name')}
            className="w-full p-5 flex justify-between items-center border-b border-[#e5dccb] hover:bg-white transition"
          >
            <div className="text-left">
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-medium">
                {profile.full_name || '—'}
              </p>
            </div>
            <span className="text-gray-400 text-lg">→</span>
          </button>

          {/* PHONE */}
          <button
            onClick={() => openModal('phone')}
            className="w-full p-5 flex justify-between items-center hover:bg-white transition"
          >
            <div className="text-left">
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium">
                {profile.phone || '—'}
              </p>
            </div>
            <span className="text-gray-400 text-lg">→</span>
          </button>

        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-[#F7EEDF] border border-[#e5dccb] w-full max-w-md rounded-3xl p-6 space-y-5 shadow-xl">

            <h2 className="text-lg font-semibold">
              Edit {modal === 'name' ? 'Name' : 'Phone'}
            </h2>

            <input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full border border-[#e5dccb] p-3 rounded-xl bg-white"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-[#e5dccb] py-3 rounded-full hover:bg-white transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-[#C6A96B] hover:bg-[#b8965a] transition text-white py-3 rounded-full shadow-md"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  )
}