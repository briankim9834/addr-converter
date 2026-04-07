// components/Header.tsx
import Link from 'next/link'
import HamburgerMenu from '@/components/HamburgerMenu'

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="text-blue-600 font-extrabold text-base leading-tight tracking-tight">
            ⚡ 도구함
          </span>
          <span className="text-slate-400 text-xs">직장인을 위한 실용 도구들</span>
        </Link>
        <HamburgerMenu />
      </div>
    </header>
  )
}
