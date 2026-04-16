'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import QRCode from 'react-qr-code'

export default function ProfilePage() {
  const router = useRouter()


  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [points, setPoints] = useState<number>(0)
  const [inputPoints, setInputPoints] = useState<number>(0)
  const [qrValue, setQrValue] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

      if (data) {
        setProfile(data)
        setPoints(data.points || 0)
      }
    }

    fetchUser()
  }, [])

  const euroValue = parseFloat((inputPoints * 0.1).toFixed(2))
  const totalEuro = parseFloat((points * 0.1).toFixed(2))

  const handleGenerateQR = async () => {
    if (!user) return

    if (inputPoints < 10) {
      alert('Minimum is 10 points (€1)')
      return
    }

    if (inputPoints > points) {
      alert('Not enough points')
      return
    }

    setLoading(true)

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    const { data, error } = await supabase
      .from('point_redemptions')
      .insert({
        user_id: user.id,
        points: inputPoints,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      console.error(error)
      alert('Error generating QR')
      return
    }

    setQrValue(data.id)
  }

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
        <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-3xl p-6 shadow-xl space-y-2">
          <p className="text-sm text-gray-500">Full Name</p>
          <p className="font-medium">{profile?.full_name || '—'}</p>

          <p className="text-sm text-gray-500 mt-3">Email</p>
          <p className="font-medium">{profile?.email || user?.email}</p>

          <p className="text-sm text-gray-500 mt-3">Phone</p>
          <p className="font-medium">{profile?.phone || '—'}</p>
        </div>

        {/* POINTS CARD */}
        <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-3xl p-6 shadow-xl text-center">
          <p className="text-gray-500">Fresh Points</p>
          <h2 className="text-4xl font-bold">{points}</h2>
          <p className="text-gray-500 mt-2">Value: €{totalEuro}</p>
        </div>

        {/* REDEEM */}
        <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-semibold">Redeem Points</h3>

          <input
            type="number"
            placeholder="Enter points"
            value={inputPoints}
            onChange={(e) => setInputPoints(Number(e.target.value))}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C6A96B]"
          />

          <p className="text-gray-500">
            = €{isNaN(euroValue) ? '0.00' : euroValue}
          </p>

          <button
            onClick={handleGenerateQR}
            disabled={loading}
            className="w-full bg-[#C6A96B] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>

        {/* QR */}
        {qrValue && (
          <div className="bg-white p-6 rounded-3xl flex flex-col items-center shadow-xl">
            <QRCode value={qrValue} size={200} />
            <p className="text-black mt-4 text-sm">
              Show this QR to staff
            </p>
          </div>
        )}

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Logout
        </button>

      </div>
    </div>
  )
}