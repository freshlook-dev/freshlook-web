'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type Profile = {
  full_name: string | null
  email: string | null
  phone: string | null
  points: number | null
}

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        window.location.href = '/login'
        return
      }

      setUser(currentUser)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (data) {
        setProfile(data as Profile)
      }
    }

    void fetchUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const points = profile?.points || 0
  const euro = (points * 0.1).toFixed(2)

  return (
    <div className="min-h-screen bg-[#F7EEDF] p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Profile</h1>
        </div>

        <div className="relative space-y-2 rounded-3xl border border-[#e5dccb] bg-[#F7EEDF] p-6 shadow-md">
          <button
            onClick={() => router.push('/settings')}
            className="absolute right-4 top-4 text-sm text-gray-600 hover:text-black"
          >
            Settings {'->'}
          </button>

          <p className="text-sm text-gray-500">Full Name</p>
          <p className="font-medium">{profile?.full_name || '-'}</p>

          <p className="mt-3 text-sm text-gray-500">Email</p>
          <p className="font-medium">{profile?.email || user?.email}</p>

          <p className="mt-3 text-sm text-gray-500">Phone</p>
          <p className="font-medium">{profile?.phone || '-'}</p>
        </div>

        <div className="rounded-3xl border border-[#e5dccb] bg-[#F7EEDF] p-6 text-center shadow-md">
          <p className="text-gray-500">Fresh Points</p>
          <h2 className="text-4xl font-bold text-[#C6A96B]">{points}</h2>
          <p className="mt-2 text-gray-500">Value: EUR {euro}</p>

          <button
            onClick={() => router.push('/profile/points')}
            className="mt-4 w-full rounded-xl bg-[#C6A96B] py-3 text-white shadow"
          >
            Use Points
          </button>
        </div>

        <div className="space-y-4 rounded-3xl border border-[#e5dccb] bg-[#F7EEDF] p-6 shadow-md">
          <button
            onClick={() => router.push('/profile/orders')}
            className="flex w-full items-center justify-between rounded-xl border p-4 transition hover:bg-white"
          >
            <span className="font-medium">Purchase History</span>
            <span className="text-gray-400">{'->'}</span>
          </button>

          <button
            onClick={() => router.push('/profile/treatments')}
            className="flex w-full items-center justify-between rounded-xl border p-4 transition hover:bg-white"
          >
            <span className="font-medium">Treatment History</span>
            <span className="text-gray-400">{'->'}</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-black py-3 text-white"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
