'use client'

import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/profile')}
            className="text-sm text-gray-600 hover:text-black"
          >
            ← Back to Profile
          </button>
        </div>

        <h1 className="text-2xl font-semibold">Settings</h1>

        {/* SETTINGS LIST */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">

          {/* PERSONAL INFO */}
          <button
            onClick={() => router.push('/settings/personal')}
            className="w-full flex items-center justify-between p-5 border-b hover:bg-gray-50 transition"
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

          {/* CHANGE PASSWORD */}
          <button
            onClick={() => router.push('/settings/password')}
            className="w-full flex items-center justify-between p-5 border-b hover:bg-gray-50 transition"
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

          {/* FUTURE */}
          <div className="p-5 text-gray-400 text-sm">
            More settings coming soon...
          </div>

        </div>

      </div>
    </div>
  )
}