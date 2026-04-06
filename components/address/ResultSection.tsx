// components/address/ResultSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { ParsedAddress, SelectedAddress } from '@/types/address'
import { formatFullAddress } from '@/lib/address'
import ResultCard from './ResultCard'
import EditPanel from './EditPanel'

interface ResultSectionProps {
  address: ParsedAddress
  selected: SelectedAddress
  onReset: () => void
  onReconvert: (detail: string) => Promise<void>
  isConverting: boolean
}

export default function ResultSection({
  address,
  selected,
  onReset,
  onReconvert,
  isConverting,
}: ResultSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editDetail, setEditDetail] = useState(address.addressLine2)
  const [localAddress, setLocalAddress] = useState(address)
  const [copiedAll, setCopiedAll] = useState(false)

  useEffect(() => {
    setLocalAddress(address)
    setEditDetail(address.addressLine2)
  }, [address])

  function handleAddressLine2Change(value: string) {
    const updated = {
      ...localAddress,
      addressLine2: value,
      fullAddress: formatFullAddress({ ...localAddress, addressLine2: value }),
    }
    setLocalAddress(updated)
  }

  async function handleReconvert() {
    await onReconvert(editDetail)
    setIsEditing(false)
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(localAddress.fullAddress)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }

  return (
    <div>
      {/* 현재 주소 요약 + 수정/초기화 */}
      {!isEditing && (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1">현재 변환 중인 주소</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {selected.korean}
            </p>
            {localAddress.addressLine2 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {localAddress.addressLine2}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
            >
              ✏️ 수정
            </button>
            <button
              onClick={onReset}
              className="bg-red-50 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors"
            >
              ↺ 초기화
            </button>
          </div>
        </div>
      )}

      {/* 수정 패널 */}
      {isEditing && (
        <EditPanel
          selected={selected}
          detail={editDetail}
          onDetailChange={setEditDetail}
          onReconvert={handleReconvert}
          onCancel={() => setIsEditing(false)}
          isConverting={isConverting}
        />
      )}

      {/* 결과 카드들 */}
      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">
        변환 결과 — 항목별 복사
      </p>

      <div className={`grid gap-2.5 ${isEditing ? 'opacity-30 pointer-events-none' : ''}`}>
        <ResultCard
          label="Street Address 1"
          subLabel="/ Address Line 1"
          value={localAddress.addressLine1}
        />
        {localAddress.addressLine2 !== '' && (
          <ResultCard
            label="Street Address 2"
            subLabel="/ Address Line 2"
            value={localAddress.addressLine2}
            editable
            warning="AI 번역 결과예요. 클릭해서 수정 후 복사하세요."
            onChange={handleAddressLine2Change}
          />
        )}
        <ResultCard label="City" value={localAddress.city} />
        <ResultCard
          label="State"
          subLabel="/ Province / Region"
          value={localAddress.state}
        />
        <ResultCard
          label="Zip Code"
          subLabel="/ Postal Code"
          value={localAddress.zipCode}
        />
        <ResultCard label="Country" value={localAddress.country} />

        {/* 전체 복사 */}
        <button
          onClick={handleCopyAll}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl px-4 py-4 flex items-center justify-between mt-1 hover:opacity-95 transition-opacity"
        >
          <div className="text-left">
            <p className="text-xs text-white/70 font-semibold mb-1">
              전체 주소 한 번에 복사
            </p>
            <p className="text-xs text-white leading-relaxed">
              {localAddress.fullAddress}
            </p>
          </div>
          <span className="bg-white text-indigo-600 text-xs font-bold px-3 py-2 rounded-lg ml-4 whitespace-nowrap flex-shrink-0">
            {copiedAll ? '✓ 복사됨' : '전체 복사'}
          </span>
        </button>
      </div>
    </div>
  )
}
