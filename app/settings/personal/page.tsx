'use client'

import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type Profile = {
  full_name: string
  phone: string
  avatar_url: string
}

export default function PersonalPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    avatar_url: '',
  })
  const [modal, setModal] = useState<null | 'name' | 'phone'>(null)
  const [tempValue, setTempValue] = useState('')

  const fetchUser = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      router.push('/login')
      return
    }

    setUser(currentUser)

    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, avatar_url')
      .eq('id', currentUser.id)
      .single()

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || '',
      })
    }
  }, [router])

  useEffect(() => {
    void fetchUser()
  }, [fetchUser])

  const openModal = (type: 'name' | 'phone') => {
    setModal(type)
    setTempValue(type === 'name' ? profile.full_name : profile.phone)
  }

  const handleSave = async () => {
    if (!user || !modal) return

    setLoading(true)

    const updates = modal === 'name' ? { full_name: tempValue } : { phone: tempValue }

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setModal(null)
    void fetchUser()
  }

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file || !user) return

      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const publicUrl = data.publicUrl

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)

      setProfile((prev) => ({
        ...prev,
        avatar_url: publicUrl,
      }))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to upload image'
      alert(message)
    }

    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-[#F7EEDF] p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <button
          onClick={() => router.push('/settings')}
          className="text-sm text-gray-500 hover:text-black"
        >
          {'<-'} Back to Settings
        </button>

        <h1 className="text-2xl font-semibold">Personal Information</h1>

        <div className="flex flex-col items-center gap-3">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[#e5dccb] bg-white shadow-md">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-400">No Photo</span>
            )}
          </div>

          <label className="cursor-pointer text-sm text-[#C6A96B]">
            {uploading ? 'Uploading...' : 'Change Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#e5dccb] bg-[#F7EEDF] shadow-md">
          <button
            onClick={() => openModal('name')}
            className="flex w-full items-center justify-between border-b border-[#e5dccb] p-5 transition hover:bg-white"
          >
            <div className="text-left">
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-medium">{profile.full_name || '-'}</p>
            </div>
            <span className="text-lg text-gray-400">{'->'}</span>
          </button>

          <button
            onClick={() => openModal('phone')}
            className="flex w-full items-center justify-between p-5 transition hover:bg-white"
          >
            <div className="text-left">
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium">{profile.phone || '-'}</p>
            </div>
            <span className="text-lg text-gray-400">{'->'}</span>
          </button>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-5 rounded-3xl border border-[#e5dccb] bg-[#F7EEDF] p-6 shadow-xl">
            <h2 className="text-lg font-semibold">
              Edit {modal === 'name' ? 'Name' : 'Phone'}
            </h2>

            <input
              value={tempValue}
              onChange={(event) => setTempValue(event.target.value)}
              className="w-full rounded-xl border border-[#e5dccb] bg-white p-3"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 rounded-full border border-[#e5dccb] py-3 transition hover:bg-white"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 rounded-full bg-[#C6A96B] py-3 text-white shadow-md transition hover:bg-[#b8965a]"
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
