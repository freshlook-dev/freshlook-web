'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function PersonalPage() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
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
      .select('full_name, phone')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
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

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* BACK */}
        <button
          onClick={() => router.push('/settings')}
          className="text-sm text-gray-600 hover:text-black"
        >
          ← Back to Settings
        </button>

        <h1 className="text-2xl font-semibold">
          Personal Information
        </h1>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow divide-y">

          {/* NAME */}
          <button
            onClick={() => openModal('name')}
            className="w-full p-5 flex justify-between items-center hover:bg-gray-50"
          >
            <div className="text-left">
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">
                {profile.full_name || '—'}
              </p>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          {/* PHONE */}
          <button
            onClick={() => openModal('phone')}
            className="w-full p-5 flex justify-between items-center hover:bg-gray-50"
          >
            <div className="text-left">
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">
                {profile.phone || '—'}
              </p>
            </div>
            <span className="text-gray-400">→</span>
          </button>

        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl">

            <h2 className="text-lg font-semibold">
              Edit {modal === 'name' ? 'Name' : 'Phone'}
            </h2>

            <input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full border p-3 rounded-xl"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border py-2 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-[#C6A96B] text-white py-2 rounded-xl"
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