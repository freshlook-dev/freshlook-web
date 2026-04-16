'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function PasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const validate = () => {
    if (!password || !confirm) {
      setError('Please fill all fields')
      return false
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }

    if (password !== confirm) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleUpdate = async () => {
    setError(null)
    setSuccess(null)

    if (!validate()) return

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Password updated successfully')

    setPassword('')
    setConfirm('')
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
          Change Password
        </h1>

        {/* CARD */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-5">

          {/* NEW PASSWORD */}
          <div>
            <label className="text-sm text-gray-500">
              New Password
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-3 rounded-xl pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm text-gray-500"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-sm text-gray-500">
              Confirm Password
            </label>

            <div className="relative mt-1">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border p-3 rounded-xl pr-12"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-sm text-gray-500"
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* FEEDBACK */}
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm">
              {success}
            </div>
          )}

          {/* BUTTON */}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white transition ${
              loading
                ? 'bg-gray-400'
                : 'bg-[#C6A96B] hover:opacity-90'
            }`}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>

        </div>

        {/* SECURITY NOTE */}
        <p className="text-xs text-gray-400 text-center">
          For security reasons, use a strong password you don’t use elsewhere.
        </p>

      </div>
    </div>
  )
}