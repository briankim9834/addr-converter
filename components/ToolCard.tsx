// components/ToolCard.tsx
import Link from 'next/link'

interface ToolCardProps {
  icon: string
  title: string
  description: string
  href: string
}

export default function ToolCard({ icon, title, description, href }: ToolCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-indigo-100">
        <div className="text-3xl mb-3">{icon}</div>
        <h2 className="font-bold text-indigo-950 mb-1 text-sm">{title}</h2>
        <p className="text-gray-500 text-xs leading-relaxed mb-4">{description}</p>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold py-2 rounded-lg text-center">
          바로 사용 →
        </div>
      </div>
    </Link>
  )
}
