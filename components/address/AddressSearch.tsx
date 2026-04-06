// components/address/AddressSearch.tsx
'use client'

import { KakaoAddressData, SelectedAddress } from '@/types/address'

// 카카오 우편번호 window 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: KakaoAddressData) => void
        width?: string
        height?: string
      }) => { open: () => void }
    }
  }
}

interface AddressSearchProps {
  selected: SelectedAddress | null
  onSelect: (address: SelectedAddress) => void
  onReset: () => void
}

export default function AddressSearch({
  selected,
  onSelect,
  onReset,
}: AddressSearchProps) {
  function openKakaoPostcode() {
    if (!window.daum?.Postcode) {
      alert('주소 검색 서비스를 불러오는 중이에요. 잠시 후 다시 시도해주세요.')
      return
    }
    new window.daum.Postcode({
      oncomplete(data: KakaoAddressData) {
        onSelect({
          korean: data.roadAddress || data.jibunAddress,
          zonecode: data.zonecode,
        })
      },
    }).open()
  }

  if (selected) {
    return (
      <div className="bg-slate-800 border-2 border-emerald-400 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-lg">✅</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-emerald-400 font-semibold mb-0.5">
            도로명 주소 선택됨
          </p>
          <p className="text-sm font-medium text-white truncate">
            {selected.korean}
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 underline hover:text-slate-200 whitespace-nowrap flex-shrink-0"
        >
          변경
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={openKakaoPostcode}
      className="w-full bg-slate-800 border-2 border-emerald-500 rounded-xl px-4 py-3 flex items-center gap-3 shadow-[0_0_0_4px_rgba(52,211,153,0.1)] hover:border-emerald-400 transition-colors text-left"
    >
      <span className="text-xl">🔍</span>
      <div>
        <p className="text-xs text-emerald-400 font-semibold mb-0.5">
          ① 도로명 주소 검색
        </p>
        <p className="text-sm text-slate-400">
          예) 테헤란로 152, 강남구 역삼동...
        </p>
      </div>
    </button>
  )
}
