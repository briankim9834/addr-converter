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
    <div className="bg-slate-800 border-2 border-amber-400/60 rounded-xl p-4 mb-4">
      <p className="text-xs font-bold text-amber-400 mb-3">✏️ 주소 수정</p>

      <div className="bg-slate-700 border border-emerald-500/50 rounded-lg px-3 py-2 flex items-center gap-2 mb-2">
        <span className="text-base">🔍</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-emerald-400 font-semibold mb-0.5">도로명 주소</p>
          <p className="text-sm text-slate-100 truncate">{selected.korean}</p>
        </div>
        <span className="text-xs text-slate-500 text-right leading-tight">
          주소 변경은<br />초기화 후 재검색
        </span>
      </div>

      <div className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-slate-400 font-semibold mb-1.5">상세주소 수정</p>
        <input
          type="text"
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
          className="w-full bg-slate-600 border border-slate-500 rounded-md px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReconvert}
          disabled={isConverting}
          className="flex-1 bg-emerald-500 text-slate-900 text-sm font-bold py-2 rounded-lg disabled:opacity-50 hover:bg-emerald-400 transition-colors"
        >
          {isConverting ? '변환 중...' : '다시 변환'}
        </button>
        <button
          onClick={onCancel}
          className="bg-slate-600 text-slate-300 text-sm px-4 py-2 rounded-lg hover:bg-slate-500 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
