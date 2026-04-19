'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const router = useRouter()

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

      </div>
    </div>
  )
}