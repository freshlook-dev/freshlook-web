'use client'

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-neutral-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6 border">

        <div className="text-center">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  )
}