// app/address/page.tsx
'use client'

import { useState } from 'react'
import { ParsedAddress, SelectedAddress } from '@/types/address'
import { parseEngAddr, formatFullAddress } from '@/lib/address'
import AddressSearch from '@/components/address/AddressSearch'
import DetailInput from '@/components/address/DetailInput'
import ResultSection from '@/components/address/ResultSection'
import SiteGuide from '@/components/address/SiteGuide'

type Step = 'search' | 'detail' | 'result'

export default function AddressPage() {
  const [step, setStep] = useState<Step>('search')
  const [selected, setSelected] = useState<SelectedAddress | null>(null)
  const [detailKorean, setDetailKorean] = useState('')
  const [parsedAddress, setParsedAddress] = useState<ParsedAddress | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  function handleReset() {
    setStep('search')
    setSelected(null)
    setDetailKorean('')
    setParsedAddress(null)
  }

  function handleSelect(address: SelectedAddress) {
    setSelected(address)
    setStep('detail')
  }

  async function translateDetail(korean: string): Promise<string> {
    if (!korean.trim()) return ''
    try {
      const res = await fetch('/api/papago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: korean }),
      })
      if (!res.ok) return korean
      const data = await res.json()
      return data.translatedText ?? korean
    } catch {
      return korean
    }
  }

  async function handleConvert(detail: string = detailKorean) {
    if (!selected) return
    setIsConverting(true)

    try {
      const jusoRes = await fetch(
        `/api/juso?keyword=${encodeURIComponent(selected.korean)}`
      )
      if (!jusoRes.ok) throw new Error('JUSO API 오류')
      const jusoData = await jusoRes.json()

      if (!jusoData.juso?.length) {
        alert('주소 변환 결과를 찾을 수 없어요. 다시 검색해주세요.')
        return
      }

      const base = parseEngAddr(jusoData.juso[0])

      const addressLine2 = detail.trim() ? await translateDetail(detail) : ''

      const final: ParsedAddress = {
        ...base,
        addressLine2,
        fullAddress: formatFullAddress({ ...base, addressLine2 }),
      }

      setParsedAddress(final)
      setStep('result')
    } catch {
      alert('주소 변환에 실패했어요. 다시 시도해주세요.')
    } finally {
      setIsConverting(false)
    }
  }

  async function handleReconvert(detail: string) {
    await handleConvert(detail)
  }

  // Dummy handler for DetailInput's onTranslate — translation happens in handleConvert
  async function handleDetailTranslate(korean: string) {
    setDetailKorean(korean)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-indigo-950 mb-1">
          🗺️ 영문주소 변환기
        </h1>
        <p className="text-sm text-gray-500">해외배송·직구 주소 입력이 쉬워져요</p>
      </div>

      {step !== 'result' && (
        <div className="grid gap-3 mb-4">
          <AddressSearch
            selected={selected}
            onSelect={handleSelect}
            onReset={handleReset}
          />

          {step === 'detail' && selected && (
            <>
              <DetailInput
                value={detailKorean}
                onChange={setDetailKorean}
                onTranslate={handleDetailTranslate}
                isTranslating={false}
              />
              <button
                onClick={() => handleConvert(detailKorean)}
                disabled={isConverting}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 hover:opacity-95 transition-opacity"
              >
                {isConverting ? '변환 중...' : '🗺️ 영문 주소로 변환하기'}
              </button>
            </>
          )}

          {step === 'search' && (
            <div className="bg-white/60 border border-violet-100 rounded-xl p-4 text-xs text-gray-500 leading-6">
              💡 <strong className="text-gray-700">이렇게 사용하세요</strong>
              <br />
              1. 위 검색창을 눌러 도로명 주소를 검색하세요
              <br />
              2. 동·호수·건물명을 상세주소에 입력하세요
              <br />
              3. 항목별 복사 버튼으로 바로 사용하세요
            </div>
          )}
        </div>
      )}

      {step === 'result' && parsedAddress && selected && (
        <>
          <ResultSection
            address={parsedAddress}
            selected={selected}
            onReset={handleReset}
            onReconvert={handleReconvert}
            isConverting={isConverting}
          />
          <SiteGuide address={parsedAddress} />
        </>
      )}
    </div>
  )
}
