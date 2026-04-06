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
      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">
        사이트별 입력 가이드
      </p>

      <div className="flex gap-2 mb-3 flex-wrap">
        {(Object.keys(SITE_LABELS) as SiteKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              active === key
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {SITE_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <p className="text-xs font-semibold text-gray-700 mb-3">
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
                <span className="text-xs text-gray-400 w-36 flex-shrink-0">
                  {label}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded flex-1 ${
                    label === 'Full Name'
                      ? 'bg-gray-50 text-gray-400 italic'
                      : 'bg-indigo-50 text-indigo-700 font-medium'
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
