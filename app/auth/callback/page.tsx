'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      await supabase.auth.getSession()

      setTimeout(() => {
        router.replace('/')
      }, 300)
    }

    void init()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      Signing you in...
    </div>
  )
}
