// app/vat/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '부가세 계산기 — 공급가액·합계금액 자동 계산',
  description:
    '공급가액 또는 합계금액을 입력하면 부가세(10%)를 자동으로 계산해드립니다. 세금계산서 작성, 견적서 정리에 바로 활용하세요.',
  keywords: ['부가세계산기', '부가세 계산', '공급가액 계산', '합계금액 부가세', '세금계산서', '부가가치세'],
  alternates: { canonical: 'https://doguham.kr/vat' },
  openGraph: {
    title: '부가세 계산기 — 공급가액·합계금액 자동 계산',
    description: '공급가액 또는 합계금액을 입력하면 부가세(10%)를 자동으로 계산해드립니다.',
    url: 'https://doguham.kr/vat',
  },
}

export default function VatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
