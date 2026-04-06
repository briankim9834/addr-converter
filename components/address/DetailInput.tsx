// components/address/DetailInput.tsx
'use client'

interface DetailInputProps {
  onChange: (value: string) => void
}

export default function DetailInput({ onChange }: DetailInputProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-500 font-semibold mb-2">
        ② 상세주소 입력{' '}
        <span className="font-normal text-gray-400">
          — 동/호수/건물명 (선택사항)
        </span>
      </p>
      <input
        type="text"
        onChange={(e) => onChange(e.target.value)}
        placeholder="예) 헬리오시티 101동 1103호"
        className="w-full bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400"
      />
    </div>
  )
}
