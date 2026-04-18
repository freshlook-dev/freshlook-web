'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const router = useRouter()

  const [avatar, setAvatar] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      if (data?.avatar_url) {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.avatar_url}`
        setAvatar(url)
      }
    }

    fetchProfile()
  }, [])

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // GET OLD AVATAR
    const { data: old } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    // DELETE OLD FILE
    if (old?.avatar_url) {
      await supabase.storage
        .from('avatars')
        .remove([old.avatar_url])
    }

    // FORCE CONSISTENT NAME
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}.${fileExt}`

    // UPLOAD NEW
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
      })

    if (error) {
      alert('Upload failed')
      setUploading(false)
      return
    }

    // SAVE CLEAN VALUE (ONLY FILENAME)
    await supabase
      .from('profiles')
      .update({ avatar_url: fileName })
      .eq('id', user.id)

    // UPDATE UI
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`
    setAvatar(url)

    setUploading(false)
  }

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )

    if (!confirmDelete) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#F7EEDF] p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <button
            onClick={() => router.push('/profile')}
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Profile
          </button>

          {/* AVATAR */}
          <div className="relative group">

            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e5dccb] bg-gray-100">
  {avatar && (
    <img
      src={`${avatar}?t=${Date.now()}`}
      className="w-full h-full object-cover"
    />
  )}
</div>

            {/* UPLOAD */}
            <label className="absolute bottom-0 right-0 bg-[#C6A96B] text-white text-xs px-2 py-1 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition">
              Edit
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>

          </div>

        </div>

        <h1 className="text-2xl font-semibold">Settings</h1>

        {/* SETTINGS */}
        <div className="bg-[#F7EEDF] border border-[#e5dccb] rounded-3xl shadow-md overflow-hidden">

          {/* PERSONAL */}
          <button
            onClick={() => router.push('/settings/personal')}
            className="w-full flex items-center justify-between p-5 border-b border-[#e5dccb] hover:bg-white transition"
          >
            <div className="text-left">
              <p className="font-medium leading-none">
                Personal Information
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Name, phone, email
              </p>
            </div>

            <span className="text-gray-400 text-lg">→</span>
          </button>

          {/* PASSWORD */}
          <button
            onClick={() => router.push('/settings/password')}
            className="w-full flex items-center justify-between p-5 border-b border-[#e5dccb] hover:bg-white transition"
          >
            <div className="text-left">
              <p className="font-medium leading-none">
                Change Password
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Update your account password
              </p>
            </div>

            <span className="text-gray-400 text-lg">→</span>
          </button>

          {/* DELETE */}
          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition"
          >
            <div className="text-left">
              <p className="font-medium text-red-600">
                Delete Account
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Permanently remove your account
              </p>
            </div>

            <span className="text-red-400 text-lg">→</span>
          </button>

        </div>

        {uploading && (
          <p className="text-sm text-gray-500 text-center">
            Uploading...
          </p>
        )}

      </div>
    </div>
  )
}