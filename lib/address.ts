// lib/address.ts
import { JusoItem, ParsedAddress } from '@/types/address'

/**
 * JUSO API의 개별 영문 필드를 사용해 구조화된 영문 주소를 반환한다.
 * (engAddr 단일 문자열 파싱 방식 사용 안 함 — 스펙 섹션 4-2 참조)
 */
export function parseEngAddr(juso: JusoItem): ParsedAddress {
  const buildingNum =
    juso.buldSlno && juso.buldSlno !== '0'
      ? `${juso.buldMnnm}-${juso.buldSlno}`
      : juso.buldMnnm

  const addressLine1 = `${buildingNum} ${juso.rn}, ${juso.sggNm}`
  const city = juso.siNm
  const state = juso.siNm

  const base: ParsedAddress = {
    addressLine1,
    addressLine2: '',
    city,
    state,
    zipCode: juso.zipNo,
    country: 'South Korea',
    fullAddress: '',
  }

  return { ...base, fullAddress: formatFullAddress(base) }
}

/**
 * ParsedAddress를 해외 배송용 전체 주소 한 줄로 포맷한다.
 * addressLine2 내부의 쉼표는 구분자와 혼동되지 않도록 제거한다.
 */
export function formatFullAddress(address: ParsedAddress): string {
  const parts = [
    address.addressLine1,
    address.addressLine2 ? address.addressLine2.replace(/,/g, '') : null,
    `${address.city} ${address.zipCode}`,
    address.country,
  ].filter(Boolean) as string[]

  return parts.join(', ')
}
