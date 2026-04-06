// components/address/DetailInput.tsx
'use client'

interface DetailInputProps {
  onChange: (value: string) => void
}

export default function DetailInput({ onChange }: DetailInputProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
      <p className="text-xs text-slate-400 font-semibold mb-2">
        ② 상세주소 입력{' '}
        <span className="font-normal text-slate-500">
          — 동/호수/건물명 (선택사항)
        </span>
      </p>
      <input
        type="text"
        onChange={(e) => onChange(e.target.value)}
        placeholder="예) 헬리오시티 101동 1103호"
        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
      />
    </div>
  )
}
