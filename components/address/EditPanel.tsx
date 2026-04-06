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
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-4">
      <p className="text-xs font-bold text-amber-700 mb-3">✏️ 주소 수정</p>

      <div className="bg-white border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2 mb-2">
        <span className="text-base">🔍</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-blue-600 font-semibold mb-0.5">도로명 주소</p>
          <p className="text-sm text-slate-900 truncate">{selected.korean}</p>
        </div>
        <span className="text-xs text-slate-400 text-right leading-tight">
          주소 변경은<br />초기화 후 재검색
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-slate-500 font-semibold mb-1.5">상세주소 수정</p>
        <input
          type="text"
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
          className="w-full bg-blue-50 border border-blue-100 rounded-md px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReconvert}
          disabled={isConverting}
          className="flex-1 bg-blue-600 text-white text-sm font-bold py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {isConverting ? '변환 중...' : '다시 변환'}
        </button>
        <button
          onClick={onCancel}
          className="bg-slate-100 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
