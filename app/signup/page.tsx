'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

export default function SignupPage() {
const router = useRouter()


const [fullName, setFullName] = useState('')
const [phone, setPhone] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [loading, setLoading] = useState(false)

const handleSignup = async () => {
if (!fullName || !email || !password) {
alert('Please fill all fields')
return
}


if (password !== confirmPassword) {
  alert('Passwords do not match')
  return
}

setLoading(true)

// ✅ STEP 1: create auth user WITH metadata
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
  alert(error.message)
  return
}

const user = data.user

if (!user) {
  setLoading(false)
  alert('User creation failed')
  return
}

// ✅ STEP 2: auto login
await supabase.auth.signInWithPassword({
  email,
  password,
})

setLoading(false)

// ✅ STEP 3: redirect home
router.push('/')
router.refresh()


}

return ( <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-neutral-100 to-neutral-200 px-4">


  <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-3xl shadow-xl p-8 space-y-6 overflow-visible">

    <div className="flex justify-center">
      <Image src="/assets/logo.png" alt="Fresh Look" width={160} height={50} />
    </div>

    <div className="text-center">
      <h1 className="text-2xl font-semibold">Create Account</h1>
      <p className="text-sm text-gray-500">Join Fresh Look</p>
    </div>

    <div className="space-y-4">

      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C6A96B]"
      />

      <PhoneInput
        country={'xk'}
        value={phone}
        onChange={(phone) => setPhone(phone)}
        inputClass="!w-full !h-12 !rounded-xl !border !border-gray-200"
        containerClass="w-full"
        dropdownClass="!z-[9999]"
      />

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C6A96B]"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C6A96B]"
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C6A96B]"
      />

    </div>

    <button
      onClick={handleSignup}
      disabled={loading}
      className="w-full bg-[#C6A96B] text-white py-3 rounded-xl font-semibold"
    >
      {loading ? 'Creating account...' : 'Sign Up'}
    </button>

    <div className="text-center text-sm">
      Already have an account?{' '}
      <button
        onClick={() => router.push('/login')}
        className="text-[#C6A96B] font-medium"
      >
        Login
      </button>
    </div>

  </div>
</div>


)
}
