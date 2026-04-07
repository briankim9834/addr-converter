import { calcFromSupply, calcFromTotal, formatKRW, parseInput } from '@/lib/vat'

describe('calcFromSupply', () => {
  it('공급가액에서 부가세와 합계를 계산한다', () => {
    expect(calcFromSupply(1000000)).toEqual({
      supply: 1000000,
      vat: 100000,
      total: 1100000,
    })
  })
  it('소수점이 나올 경우 원 단위로 반올림한다', () => {
    const result = calcFromSupply(100)
    expect(result.vat).toBe(10)
    expect(result.total).toBe(110)
  })
  it('0 입력 시 모두 0을 반환한다', () => {
    expect(calcFromSupply(0)).toEqual({ supply: 0, vat: 0, total: 0 })
  })
})

describe('calcFromTotal', () => {
  it('합계금액에서 공급가액과 부가세를 역산한다', () => {
    expect(calcFromTotal(1100000)).toEqual({
      supply: 1000000,
      vat: 100000,
      total: 1100000,
    })
  })
  it('나누어 떨어지지 않을 경우 공급가액을 반올림하고 부가세는 차감으로 계산한다', () => {
    // 100 / 1.1 = 90.909... → 91, vat = 100 - 91 = 9
    const result = calcFromTotal(100)
    expect(result.supply).toBe(91)
    expect(result.vat).toBe(9)
    expect(result.total).toBe(100)
  })
  it('0 입력 시 모두 0을 반환한다', () => {
    expect(calcFromTotal(0)).toEqual({ supply: 0, vat: 0, total: 0 })
  })
})

describe('formatKRW', () => {
  it('천 단위 콤마로 포맷한다', () => {
    expect(formatKRW(1000000)).toBe('1,000,000')
  })
  it('소수점은 반올림한다', () => {
    expect(formatKRW(1000.6)).toBe('1,001')
  })
})

describe('parseInput', () => {
  it('콤마를 제거하고 숫자로 파싱한다', () => {
    expect(parseInput('1,000,000')).toBe(1000000)
  })
  it('빈 문자열은 0을 반환한다', () => {
    expect(parseInput('')).toBe(0)
  })
  it('숫자가 아닌 문자열은 0을 반환한다', () => {
    expect(parseInput('abc')).toBe(0)
  })
})
