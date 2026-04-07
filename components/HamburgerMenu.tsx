'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TOOLS = [
  {
    icon: '🧾',
    name: '부가세 계산기',
    description: '공급가액·합계금액 계산',
    href: '/vat',
    available: true,
  },
  {
    icon: '🗺️',
    name: '영문주소 변환기',
    description: '해외배송·직구 주소 변환',
    href: '/address',
    available: true,
  },
  {
    icon: '📅',
    name: 'D-day 계산기',
    description: '날짜·기간 계산',
    href: '#',
    available: false,
  },
  {
    icon: '💱',
    name: '환율 계산기',
    description: '실시간 환율 변환',
    href: '#',
    available: false,
  },
]

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      <button
        aria-label="메뉴 열기"
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center gap-1 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        <span className="block w-4 h-0.5 bg-slate-500 rounded" />
        <span className="block w-4 h-0.5 bg-slate-500 rounded" />
        <span className="block w-4 h-0.5 bg-slate-500 rounded" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-slate-900/35 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 bottom-0 w-56 bg-white z-50 shadow-xl transform transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ right: 'max(0px, calc((100vw - 42rem) / 2))' }}
      >
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            도구 선택
          </p>
        </div>
        <ul>
          {TOOLS.map((tool) => {
            const isActive = tool.available && pathname.startsWith(tool.href)
            return (
              <li key={tool.name}>
                {tool.available ? (
                  <Link
                    href={tool.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-slate-50 transition-colors ${
                      isActive ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold leading-tight ${
                          isActive ? 'text-blue-600' : 'text-slate-800'
                        }`}
                      >
                        {tool.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                    {isActive && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold shrink-0">
                        사용중
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 opacity-40 cursor-default">
                    <span className="text-xl">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-tight">
                        {tool.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold shrink-0">
                      준비중
                    </span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
