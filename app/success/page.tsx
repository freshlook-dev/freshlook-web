import { Suspense } from 'react'
import SuccessContent from './SuccessContent'

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}