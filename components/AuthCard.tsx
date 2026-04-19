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
    <div className="min-h-screen flex items-center justify-center bg-[#F7EEDF] px-4">
      <div className="bg-[#F7EEDF]/95 backdrop-blur-md border border-[#e5dccb] rounded-2xl shadow-xl p-6">

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