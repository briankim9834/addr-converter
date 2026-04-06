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
      <div className="bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-emerald-900/20 hover:shadow-lg transition-all cursor-pointer border border-slate-700 hover:border-emerald-500/40">
        <div className="text-3xl mb-3">{icon}</div>
        <h2 className="font-bold text-white mb-1 text-sm">{title}</h2>
        <p className="text-slate-400 text-xs leading-relaxed mb-4">{description}</p>
        <div className="bg-emerald-500 text-slate-900 text-xs font-bold py-2 rounded-lg text-center">
          바로 사용 →
        </div>
      </div>
    </Link>
  )
}
