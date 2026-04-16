'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AuthCard from '@/components/AuthCard'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)

    if (!email || !password) {
      setError('Please fill all fields')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    await supabase.auth.getSession()

    setLoading(false)

    router.push('/')
    router.refresh()
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Login to your account"
    >
      <div className="space-y-4">

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

        {/* PASSWORD */}
        <div>
          <label className="text-sm text-gray-500">Password</label>

          <div className="relative mt-1">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded-xl pr-12"
            />

            <button
              onClick={() => setShow(!show)}
              className="absolute right-3 top-3 text-sm text-gray-500"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* FORGOT */}
        <div className="text-right text-sm">
          <button
            onClick={() => router.push('/forgot-password')}
            className="text-[#C6A96B] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white ${
            loading
              ? 'bg-gray-400'
              : 'bg-[#C6A96B] hover:opacity-90'
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* SIGNUP */}
        <p className="text-sm text-center">
          Don’t have an account?{' '}
          <span
            onClick={() => router.push('/signup')}
            className="text-[#C6A96B] cursor-pointer"
          >
            Sign up
          </span>
        </p>

      </div>
    </AuthCard>
  )
}