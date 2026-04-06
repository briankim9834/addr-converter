// components/Header.tsx
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="text-white font-extrabold text-base leading-tight tracking-tight">
            ⚡ 도구함
          </span>
          <span className="text-white/60 text-xs">직장인을 위한 실용 도구들</span>
        </Link>
        <nav>
          <Link
            href="/address"
            className="text-white/80 text-sm hover:text-white transition-colors"
          >
            영문주소 변환
          </Link>
        </nav>
      </div>
    </header>
  )
}
