// components/ToolTabs.tsx
// 도구 페이지 공통 Pill 탭 — currentPath는 각 page.tsx에서 하드코딩해서 전달
import Link from 'next/link'

interface Tab {
  label: string
  href: string
}

interface ToolTabsProps {
  tabs: Tab[]
  currentPath: string
}

export default function ToolTabs({ tabs, currentPath }: ToolTabsProps) {
  return (
    <div className="flex gap-2 px-4 pt-4 pb-1">
      {tabs.map((tab) => {
        const isActive = currentPath === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
