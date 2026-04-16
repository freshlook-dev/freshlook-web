'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AuthCard from '@/components/AuthCard'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ✅ IMPORTANT: ensure session exists (from email link)
  useEffect(() => {
    supabase.auth.getSession()
  }, [])

  const handleUpdate = async () => {
    setError(null)
    setSuccess(null)

    if (!password || !confirm) {
      setError('Please fill all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

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

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter your new password"
    >
      <div className="space-y-4">

        {/* PASSWORD */}
        <div>
          <label className="text-sm text-gray-500">New Password</label>

          <div className="relative mt-1">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded-xl pr-12"
            />

            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 text-sm text-gray-500"
            >
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* CONFIRM */}
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
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-sm text-gray-500"
            >
              {showConfirm ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-xl">
            {success}
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleUpdate}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white ${
            loading
              ? 'bg-gray-400'
              : 'bg-[#C6A96B] hover:opacity-90'
          }`}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>

      </div>
    </AuthCard>
  )
}