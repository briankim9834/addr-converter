import { parseEngAddr, formatFullAddress } from '@/lib/address'
import { JusoItem, ParsedAddress } from '@/types/address'

const seoulJuso: JusoItem = {
  roadAddr: '서울특별시 강남구 테헤란로 152',
  engAddr: '152, Teheran-ro, Gangnam-gu, Seoul',
  zipNo: '06142',
  siNm: 'Seoul',
  sggNm: 'Gangnam-gu',
  rn: 'Teheran-ro',
  buldMnnm: '152',
  buldSlno: '0',
}

const provincialJuso: JusoItem = {
  roadAddr: '경기도 수원시 팔달구 효원로 1',
  engAddr: '1, Hyowon-ro, Paldal-gu, Suwon-si, Gyeonggi-do',
  zipNo: '16359',
  siNm: 'Gyeonggi-do',
  sggNm: 'Paldal-gu',
  rn: 'Hyowon-ro',
  buldMnnm: '1',
  buldSlno: '0',
}

const withSubNumJuso: JusoItem = {
  roadAddr: '서울특별시 강남구 테헤란로 152',
  engAddr: '152-3, Teheran-ro, Gangnam-gu, Seoul',
  zipNo: '06142',
  siNm: 'Seoul',
  sggNm: 'Gangnam-gu',
  rn: 'Teheran-ro',
  buldMnnm: '152',
  buldSlno: '3',
}

describe('parseEngAddr', () => {
  it('서울 주소를 파싱한다 (4 parts)', () => {
    const result = parseEngAddr(seoulJuso)
    expect(result.addressLine1).toBe('152 Teheran-ro')
    expect(result.city).toBe('Gangnam-gu')
    expect(result.state).toBe('Seoul')
    expect(result.zipCode).toBe('06142')
    expect(result.country).toBe('South Korea')
  })

  it('도 단위 주소를 파싱한다 (5 parts)', () => {
    const result = parseEngAddr(provincialJuso)
    expect(result.addressLine1).toBe('1 Hyowon-ro')
    expect(result.city).toBe('Paldal-gu')
    expect(result.state).toBe('Gyeonggi-do')
    expect(result.zipCode).toBe('16359')
  })

  it('addressLine2는 빈 문자열로 초기화된다', () => {
    const result = parseEngAddr(seoulJuso)
    expect(result.addressLine2).toBe('')
  })

  it('건물부번이 있으면 하이픈으로 연결한다', () => {
    const result = parseEngAddr(withSubNumJuso)
    expect(result.addressLine1).toBe('152-3 Teheran-ro')
  })
})

describe('formatFullAddress', () => {
  it('상세주소 없이 전체 주소를 포맷한다', () => {
    const address: ParsedAddress = {
      addressLine1: '152 Teheran-ro',
      addressLine2: '',
      city: 'Gangnam-gu',
      state: 'Seoul',
      zipCode: '06142',
      country: 'South Korea',
      fullAddress: '',
    }
    expect(formatFullAddress(address)).toBe(
      '152 Teheran-ro, Gangnam-gu 06142, South Korea'
    )
  })

  it('상세주소가 있으면 맨 앞에 포함한다', () => {
    const address: ParsedAddress = {
      addressLine1: '152 Teheran-ro',
      addressLine2: 'Helio City Apt 101, Unit 1103',
      city: 'Gangnam-gu',
      state: 'Seoul',
      zipCode: '06142',
      country: 'South Korea',
      fullAddress: '',
    }
    expect(formatFullAddress(address)).toBe(
      'Helio City Apt 101 Unit 1103, 152 Teheran-ro, Gangnam-gu 06142, South Korea'
    )
  })
})
