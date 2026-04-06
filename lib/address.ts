// lib/address.ts
import { JusoItem, ParsedAddress } from '@/types/address'

/**
 * JUSO API의 engAddr 문자열을 파싱해 구조화된 영문 주소를 반환한다.
 *
 * engAddr 포맷 (서울/광역시): "152, Teheran-ro, Gangnam-gu, Seoul"
 * engAddr 포맷 (도 단위):     "1, Hyowon-ro, Paldal-gu, Suwon-si, Gyeonggi-do"
 */
export function parseEngAddr(juso: JusoItem): ParsedAddress {
  const parts = juso.engAddr.split(', ').map((p) => p.trim())

  const addressLine1 = `${parts[0]} ${parts[1]}, ${parts[2]}`
  const city = parts.length >= 5 ? parts[parts.length - 2] : parts[parts.length - 1]
  const state = parts[parts.length - 1]

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
 */
export function formatFullAddress(address: ParsedAddress): string {
  const parts = [
    address.addressLine1,
    address.addressLine2 ? address.addressLine2.replace(/,\s*/g, ' ') : null,
    `${address.city} ${address.zipCode}`,
    address.country,
  ].filter(Boolean) as string[]

  return parts.join(', ')
}
