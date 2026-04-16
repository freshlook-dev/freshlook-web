'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'

export default function LoginPage() {
const router = useRouter()


const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)

const handleLogin = async () => {
if (!email || !password) {
alert('Fill all fields')
return
}


setLoading(true)

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

if (error) {
  setLoading(false)
  alert(error.message)
  return
}

// ✅ Force session sync properly
await supabase.auth.getSession()

setLoading(false)

// ✅ Use router instead of hard reload
router.push('/')
router.refresh()


}

return ( <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4"> <div className="w-full max-w-md bg-white border rounded-2xl shadow p-8 space-y-6">


    <div className="flex justify-center">
      <Image src="/assets/logo.png" alt="logo" width={140} height={40} />
    </div>

    <h1 className="text-xl font-semibold text-center">Login</h1>

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full p-3 border rounded-lg"
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full p-3 border rounded-lg"
    />

    <button
      onClick={handleLogin}
      disabled={loading}
      className="w-full bg-[#C6A96B] text-white py-3 rounded-lg"
    >
      {loading ? 'Logging in...' : 'Login'}
    </button>

    <p className="text-sm text-center">
      Don’t have an account?{' '}
      <span
        className="text-[#C6A96B] cursor-pointer"
        onClick={() => router.push('/signup')}
      >
        Sign up
      </span>
    </p>

  </div>
</div>


)
}
