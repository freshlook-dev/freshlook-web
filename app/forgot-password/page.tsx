'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AuthCard from '@/components/AuthCard'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async () => {
    setError(null)
    setSuccess(null)

    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Password reset email sent. Check your inbox.')
  }

  return (
    <AuthCard
      title="Forgot password"
      subtitle="We’ll send you a reset link"
    >
      <div className="space-y-4">

        {/* BACK */}
        <button
          onClick={() => router.push('/login')}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to Login
        </button>

        {/* EMAIL */}
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-xl mt-1"
          />
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
          onClick={handleReset}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white ${
            loading
              ? 'bg-gray-400'
              : 'bg-[#C6A96B] hover:opacity-90'
          }`}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

      </div>
    </AuthCard>
  )
}