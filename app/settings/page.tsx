'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

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
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/profile')}
            className="text-sm text-gray-500 hover:text-black"
          >
            {'<-'} Back to Profile
          </button>
        </div>

        <h1 className="text-2xl font-semibold">Settings</h1>

        <div className="overflow-hidden rounded-3xl border border-[#e5dccb] bg-[#F7EEDF] shadow-md">
          <button
            onClick={() => router.push('/settings/personal')}
            className="flex w-full items-center justify-between border-b border-[#e5dccb] p-5 transition hover:bg-white"
          >
            <div className="text-left">
              <p className="font-medium leading-none">Personal Information</p>
              <p className="mt-1 text-sm text-gray-500">Name, phone, email</p>
            </div>
            <span className="text-lg text-gray-400">{'->'}</span>
          </button>

          <button
            onClick={() => router.push('/settings/password')}
            className="flex w-full items-center justify-between border-b border-[#e5dccb] p-5 transition hover:bg-white"
          >
            <div className="text-left">
              <p className="font-medium leading-none">Change Password</p>
              <p className="mt-1 text-sm text-gray-500">Update your account password</p>
            </div>
            <span className="text-lg text-gray-400">{'->'}</span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="flex w-full items-center justify-between p-5 transition hover:bg-red-50"
          >
            <div className="text-left">
              <p className="font-medium text-red-600">Delete Account</p>
              <p className="mt-1 text-sm text-gray-500">Permanently remove your account</p>
            </div>
            <span className="text-lg text-red-400">{'->'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
