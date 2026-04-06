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
      <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-200 hover:border-blue-200">
        <div className="text-3xl mb-3">{icon}</div>
        <h2 className="font-bold text-slate-900 mb-1 text-sm">{title}</h2>
        <p className="text-slate-500 text-xs leading-relaxed mb-4">{description}</p>
        <div className="bg-blue-600 text-white text-xs font-bold py-2 rounded-lg text-center hover:bg-blue-700 transition-colors">
          바로 사용 →
        </div>
      </div>
    </Link>
  )
}
