'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import AuthCard from '@/components/AuthCard'

export default function SignupPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async () => {
    setError(null)

    if (!fullName || !email || !password) {
      setError('Please fill all required fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    const user = data.user

    if (!user) {
      setLoading(false)
      setError('User creation failed')
      return
    }

    await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    router.push('/')
    router.refresh()
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Join Fresh Look"
    >
      <div className="space-y-4">

        {/* NAME */}
        <div>
          <label className="text-sm text-gray-500">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border p-3 rounded-xl mt-1"
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="text-sm text-gray-500">Phone</label>
          <PhoneInput
            country={'xk'}
            value={phone}
            onChange={(phone) => setPhone(phone)}
            inputClass="!w-full !h-12 !rounded-xl !border !border-gray-300"
            containerClass="w-full mt-1"
            dropdownClass="!z-[9999]"
          />
        </div>

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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

        {/* BUTTON */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white ${
            loading
              ? 'bg-gray-400'
              : 'bg-[#C6A96B] hover:opacity-90'
          }`}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        {/* LOGIN */}
        <p className="text-sm text-center">
          Already have an account?{' '}
          <span
            onClick={() => router.push('/login')}
            className="text-[#C6A96B] cursor-pointer"
          >
            Login
          </span>
        </p>

      </div>
    </AuthCard>
  )
}