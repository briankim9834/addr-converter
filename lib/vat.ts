export interface VatResult {
  supply: number
  vat: number
  total: number
}

export function calcFromSupply(supply: number): VatResult {
  const vat = Math.round(supply * 0.1)
  const total = supply + vat
  return { supply, vat, total }
}

export function calcFromTotal(total: number): VatResult {
  const supply = Math.round(total / 1.1)
  const vat = total - supply
  return { supply, vat, total }
}

export function formatKRW(n: number): string {
  return Math.round(n).toLocaleString('ko-KR')
}

export function parseInput(value: string): number {
  return parseFloat(value.replace(/,/g, '')) || 0
}
