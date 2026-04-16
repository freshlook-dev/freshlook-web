'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials =
    profile?.full_name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() || 'U'

  const points = profile?.points || 0
  const euro = (points * 0.1).toFixed(2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-100 to-neutral-200 p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Profile</h1>

          <div className="w-12 h-12 rounded-full bg-[#C6A96B] text-white flex items-center justify-center font-semibold text-lg">
            {initials}
          </div>
        </div>

        {/* USER INFO */}
        <div className="relative bg-white/80 backdrop-blur-xl border rounded-3xl p-6 shadow-xl space-y-2">

          <button
            onClick={() => router.push('/settings')}
            className="absolute top-4 right-4 text-sm text-gray-600 hover:text-black flex items-center gap-1"
          >
            Go to settings →
          </button>

          <p className="text-sm text-gray-500">Full Name</p>
          <p className="font-medium">{profile?.full_name || '—'}</p>

          <p className="text-sm text-gray-500 mt-3">Email</p>
          <p className="font-medium">{profile?.email || user?.email}</p>

          <p className="text-sm text-gray-500 mt-3">Phone</p>
          <p className="font-medium">{profile?.phone || '—'}</p>
        </div>

        {/* POINTS CARD */}
        <div className="bg-white/80 border rounded-3xl p-6 shadow-xl text-center">
          <p className="text-gray-500">Fresh Points</p>
          <h2 className="text-4xl font-bold">{points}</h2>
          <p className="text-gray-500 mt-2">Value: €{euro}</p>

          <button
            onClick={() => router.push('/profile/points')}
            className="mt-4 w-full bg-[#C6A96B] text-white py-3 rounded-xl"
          >
            Use Points
          </button>
        </div>

        {/* NEW CTA SECTION */}
        <div className="bg-white/80 border rounded-3xl p-6 shadow-xl space-y-4">

          <button
            onClick={() => router.push('/profile/orders')}
            className="w-full flex justify-between items-center p-4 rounded-xl border hover:bg-gray-50 transition"
          >
            <span className="font-medium">Purchase History</span>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={() => router.push('/profile/treatments')}
            className="w-full flex justify-between items-center p-4 rounded-xl border hover:bg-gray-50 transition"
          >
            <span className="font-medium">Treatment History</span>
            <span className="text-gray-400">→</span>
          </button>

        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full bg-black text-white py-3 rounded-xl"
        >
          Logout
        </button>

      </div>
    </div>
  )
}