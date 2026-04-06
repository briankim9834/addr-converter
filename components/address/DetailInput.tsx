// components/address/DetailInput.tsx
'use client'

import { useState } from 'react'

interface DetailInputProps {
  value: string
  onChange: (value: string) => void
  onTranslate: (korean: string) => Promise<void>
  isTranslating: boolean
}

export default function DetailInput({
  value,
  onChange,
  onTranslate,
  isTranslating,
}: DetailInputProps) {
  const [korean, setKorean] = useState('')

  async function handleTranslate() {
    if (!korean.trim()) return
    await onTranslate(korean)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-500 font-semibold mb-2">
        ② 상세주소 입력{' '}
        <span className="font-normal text-gray-400">
          — 동/호수/건물명 (선택사항)
        </span>
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={korean}
          onChange={(e) => setKorean(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
          placeholder="예) 헬리오시티 101동 1103호"
          className="flex-1 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400"
        />
        <button
          onClick={handleTranslate}
          disabled={isTranslating || !korean.trim()}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap hover:opacity-90 transition-opacity"
        >
          {isTranslating ? '번역 중...' : '영문 변환'}
        </button>
      </div>
    </div>
  )
}
