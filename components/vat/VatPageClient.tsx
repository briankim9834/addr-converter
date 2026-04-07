// components/vat/VatPageClient.tsx
'use client'

import { useState } from 'react'
import { calcFromSupply, calcFromTotal, formatKRW, parseInput, VatResult } from '@/lib/vat'

type Mode = 'supply' | 'total'

const MODE_TABS: { mode: Mode; label: string }[] = [
  { mode: 'supply', label: '공급가액 → 부가세' },
  { mode: 'total', label: '합계금액 → 부가세' },
]

export default function VatPageClient() {
  const [mode, setMode] = useState<Mode>('supply')
  const [inputValue, setInputValue] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const rawNumber = parseInput(inputValue)
  const result: VatResult | null = rawNumber > 0
    ? mode === 'supply'
      ? calcFromSupply(rawNumber)
      : calcFromTotal(rawNumber)
    : null

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/,/g, '')
    if (raw === '' || /^\d+$/.test(raw)) {
      setInputValue(raw ? parseInt(raw, 10).toLocaleString('ko-KR') : '')
    }
  }

  function handleModeChange(newMode: Mode) {
    setMode(newMode)
    setInputValue('')
  }

  async function handleCopy(value: number, key: string) {
    await navigator.clipboard.writeText(String(value))
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  function handleReset() {
    setInputValue('')
  }

  const inputLabel = mode === 'supply' ? '공급가액 입력' : '합계금액 입력'

  const rows: { label: string; key: keyof VatResult; highlight?: boolean }[] = [
    { label: '공급가액', key: 'supply' },
    { label: '부가세 (10%)', key: 'vat' },
    { label: '합계금액', key: 'total', highlight: true },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* 계산 모드 탭 */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
        {MODE_TABS.map(({ mode: m, label }) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === m
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 입력 */}
      <p className="text-xs font-semibold text-slate-500 mb-1.5">{inputLabel}</p>
      <div className="relative mb-5">
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInput}
          placeholder="금액을 입력하세요"
          className="w-full border-2 border-blue-500 rounded-xl px-4 py-3.5 pr-10 text-xl font-extrabold text-slate-900 outline-none placeholder:text-slate-300 placeholder:font-normal placeholder:text-base"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">원</span>
      </div>

      {/* 결과 */}
      <div className="bg-slate-50 rounded-xl overflow-hidden mb-3">
        {rows.map(({ label, key, highlight }) => (
          <div
            key={key}
            className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 ${
              highlight ? 'bg-blue-50' : ''
            }`}
          >
            <span className={`text-sm ${highlight ? 'font-bold text-blue-900' : 'text-slate-600'}`}>
              {label}
            </span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${highlight ? 'text-blue-600 text-base' : 'text-slate-800 text-sm'}`}>
                {result ? `${formatKRW(result[key])} 원` : '—'}
              </span>
              {result && (
                <button
                  onClick={() => handleCopy(result[key], key)}
                  className={`text-xs px-2 py-1 rounded-md font-semibold transition-colors ${
                    copied === key
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                  }`}
                >
                  {copied === key ? '복사됨' : '복사'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 초기화 */}
      <button
        onClick={handleReset}
        className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm font-semibold hover:bg-slate-200 transition-colors"
      >
        초기화
      </button>
    </div>
  )
}
