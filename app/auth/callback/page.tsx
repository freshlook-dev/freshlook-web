'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      // 🔥 force Supabase to load session
      await supabase.auth.getSession()

      // small delay to ensure cookie sync
      setTimeout(() => {
        router.replace('/')
      }, 300)
    }

    init()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      Signing you in...
    </div>
  )
}