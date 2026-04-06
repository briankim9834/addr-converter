// components/address/ResultCard.tsx
'use client'

import { useState } from 'react'

interface ResultCardProps {
  label: string
  subLabel?: string
  value: string
  editable?: boolean
  warning?: string
  onChange?: (value: string) => void
}

export default function ResultCard({
  label,
  subLabel,
  value,
  editable = false,
  warning,
  onChange,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={`bg-white rounded-xl px-4 py-3 border ${
        editable ? 'border-amber-400 border-2' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-xs font-bold text-slate-800">{label}</span>
          {subLabel && <span className="text-xs text-slate-400 ml-1">{subLabel}</span>}
        </div>
        <button
          onClick={handleCopy}
          disabled={!value}
          className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md disabled:opacity-30 hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
        >
          {copied ? '✓ 복사됨' : '📋 복사'}
        </button>
      </div>

      {editable ? (
        <>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:border-amber-400"
          />
          {warning && <p className="text-xs text-amber-600 mt-1.5">⚠️ {warning}</p>}
        </>
      ) : (
        <p className="text-sm font-medium text-slate-900">{value || '—'}</p>
      )}
    </div>
  )
}
