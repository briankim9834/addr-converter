// components/address/SiteGuide.tsx
'use client'

import { useState } from 'react'
import { ParsedAddress } from '@/types/address'

interface SiteGuideProps {
  address: ParsedAddress
}

type SiteKey = 'amazon' | 'aliexpress' | 'malltail'

const SITE_LABELS: Record<SiteKey, string> = {
  amazon: '🛒 Amazon',
  aliexpress: '🛍️ AliExpress',
  malltail: '📦 몰테일',
}

const SITE_FIELDS: Record<SiteKey, { label: string; key: keyof ParsedAddress }[]> = {
  amazon: [
    { label: 'Full Name', key: 'country' }, // placeholder row
    { label: 'Address Line 1', key: 'addressLine1' },
    { label: 'Address Line 2', key: 'addressLine2' },
    { label: 'City', key: 'city' },
    { label: 'State / Province', key: 'state' },
    { label: 'ZIP / Postal Code', key: 'zipCode' },
    { label: 'Country', key: 'country' },
  ],
  aliexpress: [
    { label: 'Address Line 1', key: 'addressLine1' },
    { label: 'Address Line 2', key: 'addressLine2' },
    { label: 'City', key: 'city' },
    { label: 'Province / State', key: 'state' },
    { label: 'Zip Code', key: 'zipCode' },
    { label: 'Country / Region', key: 'country' },
  ],
  malltail: [
    { label: '도로명주소 (영문)', key: 'addressLine1' },
    { label: '상세주소 (영문)', key: 'addressLine2' },
    { label: '시/도 (영문)', key: 'state' },
    { label: '우편번호', key: 'zipCode' },
  ],
}

export default function SiteGuide({ address }: SiteGuideProps) {
  const [active, setActive] = useState<SiteKey>('amazon')

  const fields = SITE_FIELDS[active]

  return (
    <div className="mt-6">
      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
        사이트별 입력 가이드
      </p>

      <div className="flex gap-2 mb-3 flex-wrap">
        {(Object.keys(SITE_LABELS) as SiteKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              active === key
                ? 'bg-emerald-500 text-slate-900'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {SITE_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
        <p className="text-xs font-semibold text-slate-300 mb-3">
          {SITE_LABELS[active]} 입력창 기준
        </p>
        <div className="grid gap-2">
          {fields.map(({ label, key }) => {
            const value =
              key === 'country' && label === 'Full Name'
                ? '영문 이름으로 입력하세요'
                : (address[key] as string) || '—'
            return (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-36 flex-shrink-0">
                  {label}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded flex-1 ${
                    label === 'Full Name'
                      ? 'bg-slate-700 text-slate-500 italic'
                      : 'bg-emerald-900/30 text-emerald-300 font-medium'
                  }`}
                >
                  {value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
