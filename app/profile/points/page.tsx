'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import QRCode from 'react-qr-code'
import { useRouter } from 'next/navigation'

export default function PointsPage() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [points, setPoints] = useState(0)
  const [inputPoints, setInputPoints] = useState(0)
  const [qrValue, setQrValue] = useState<string | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    setUser(user)

    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .single()

    if (profile) setPoints(profile.points || 0)

    const { data: historyData } = await supabase
      .from('point_redemptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setHistory(historyData || [])
  }

  const euroValue = (inputPoints * 0.1).toFixed(2)
  const totalEuro = (points * 0.1).toFixed(2)

  const handleGenerateQR = async () => {
    if (inputPoints < 10) {
      alert('Minimum is 10 points (€1)')
      return
    }

    if (inputPoints > points) {
      alert('Not enough points')
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('point_redemptions')
      .insert({
        user_id: user.id,
        points: inputPoints,
        status: 'pending',
        expires_at: null,
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      alert('Error generating QR')
      return
    }

    setQrValue(data.id)
    fetchData()
  }

  const handleSelectHistory = (item: any) => {
    if (item.status !== 'pending') {
      alert('This code has already been used')
      return
    }

    setQrValue(item.id)
  }

  return (
    <div className="min-h-screen p-6 bg-[#F7EEDF]">
      <div className="max-w-xl mx-auto space-y-6">

        {/* BACK */}
        <button
          onClick={() => router.push('/profile')}
          className="text-sm flex items-center gap-2 text-gray-500 hover:text-black"
        >
          ← Back to profile
        </button>

        <h1 className="text-2xl font-semibold">Your Points</h1>

        {/* BALANCE */}
        <div className="bg-[#F7EEDF] border border-[#e5dccb] p-6 rounded-3xl shadow-md text-center">
          <p className="text-gray-500 text-sm">Available Points</p>

          <h2 className="text-4xl font-bold text-[#C6A96B] mt-1">
            {points}
          </h2>

          <p className="text-gray-500 mt-2 text-sm">
            €{totalEuro}
          </p>
        </div>

        {/* REDEEM */}
        <div className="bg-[#F7EEDF] border border-[#e5dccb] p-6 rounded-3xl shadow-md space-y-4">
          <h3 className="font-semibold">Use Points</h3>

          <input
            type="number"
            placeholder="Enter points"
            value={inputPoints}
            onChange={(e) => setInputPoints(Number(e.target.value))}
            className="w-full border border-[#e5dccb] p-3 rounded-xl bg-white"
          />

          <p className="text-gray-500 text-sm">= €{euroValue}</p>

          <button
            onClick={handleGenerateQR}
            disabled={loading}
            className="w-full bg-[#C6A96B] hover:bg-[#b8965a] transition text-white py-3 rounded-full shadow-md"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>

        {/* QR */}
        {qrValue && (
          <div className="bg-[#F7EEDF] border-2 border-[#C6A96B] p-6 rounded-3xl flex flex-col items-center shadow-md relative">

            <button
              onClick={() => setQrValue(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
            >
              ✕
            </button>

            <QRCode value={qrValue} size={200} />

            <p className="mt-4 text-sm font-medium text-center">
              Show this QR to staff to redeem
            </p>
          </div>
        )}

        {/* HISTORY */}
        <div className="bg-[#F7EEDF] border border-[#e5dccb] p-6 rounded-3xl shadow-md">
          <h3 className="font-semibold mb-4">History</h3>

          {history.length === 0 && (
            <p className="text-gray-400 text-sm">No activity yet</p>
          )}

          {history.map((h) => (
            <div
              key={h.id}
              onClick={() => handleSelectHistory(h)}
              className={`flex justify-between items-center text-sm border-b border-[#e5dccb] py-3 transition
                ${h.status === 'pending'
                  ? 'cursor-pointer hover:bg-white'
                  : 'opacity-50 cursor-not-allowed'}
              `}
            >
              <div>
                <p className="font-medium">{h.points} pts</p>
              </div>

              <span
  className={`text-xs px-3 py-1 rounded-full ${
    h.status === 'pending'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-600'
  }`}
>
  {h.status === 'pending' ? 'active' : 'used'}
</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}