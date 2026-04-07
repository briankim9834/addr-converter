// components/Header.tsx
import Link from 'next/link'

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
        <nav className="flex gap-4">
          <Link
            href="/address"
            className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
          >
            영문주소 변환
          </Link>
          <Link
            href="/address/guide"
            className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
          >
            가이드
          </Link>
          <Link
            href="/address/faq"
            className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
          >
            FAQ
          </Link>
        </nav>
      </div>
    </header>
  )
}
