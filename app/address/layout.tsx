// app/address/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '영문주소 변환기 — 한글 주소를 영문으로 즉시 변환',
  description:
    '한글 주소를 입력하면 Address Line 1/2, City, State, ZIP Code 등 항목별 영문 주소로 즉시 변환. 각 항목을 개별 복사해 아마존·알리익스프레스·몰테일 등에 바로 입력하세요.',
  keywords: [
    '영문주소변환기',
    '주소영문변환',
    '주소 영문변환',
    '한글주소 영문변환',
    '해외배송 영문주소',
    '직구 영문주소',
  ],
  openGraph: {
    title: '영문주소 변환기',
    description: '한글 주소를 항목별 영문 주소로 즉시 변환',
  },
}

export default function AddressLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
