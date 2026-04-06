// components/address/EditPanel.tsx
'use client'

import { SelectedAddress } from '@/types/address'

interface EditPanelProps {
  selected: SelectedAddress
  detail: string
  onDetailChange: (value: string) => void
  onReconvert: () => void
  onCancel: () => void
  isConverting: boolean
}

export default function EditPanel({
  selected,
  detail,
  onDetailChange,
  onReconvert,
  onCancel,
  isConverting,
}: EditPanelProps) {
  return (
    <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 mb-4">
      <p className="text-xs font-bold text-amber-700 mb-3">✏️ 주소 수정</p>

      <div className="bg-white border-2 border-indigo-400 rounded-lg px-3 py-2 flex items-center gap-2 mb-2">
        <span className="text-base">🔍</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-indigo-500 font-semibold mb-0.5">도로명 주소</p>
          <p className="text-sm text-gray-900 truncate">{selected.korean}</p>
        </div>
        <span className="text-xs text-gray-400 text-right leading-tight">
          주소 변경은<br />초기화 후 재검색
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-gray-500 font-semibold mb-1.5">상세주소 수정</p>
        <input
          type="text"
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
          className="w-full bg-violet-50 border border-violet-200 rounded-md px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-400"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReconvert}
          disabled={isConverting}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold py-2 rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isConverting ? '변환 중...' : '다시 변환'}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
