// app/address/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '영문주소 변환기 — 한글 주소를 영문으로 즉시 변환',
  description:
    '한글 주소를 입력하면 Address Line 1/2, City, State, ZIP Code 등 항목별 영문 주소로 즉시 변환. 각 항목을 개별 복사해 아마존·알리익스프레스·몰테일 등에 바로 입력하세요.',
  keywords: [
    '영문주소변환기',
    '영문 주소 변환',
    '주소 영문변환',
    '한글주소 영문변환',
    '해외배송 영문주소',
    '직구 영문주소',
    '아마존 영문주소',
    '알리익스프레스 영문주소',
    '몰테일 영문주소',
    '영문주소 만들기',
  ],
  alternates: {
    canonical: 'https://doguham.kr/address',
  },
  openGraph: {
    title: '영문주소 변환기 — 한글 주소를 영문으로 즉시 변환',
    description: '한글 주소를 항목별 영문 주소로 즉시 변환. 해외배송·직구 주소 입력이 쉬워져요.',
    url: 'https://doguham.kr/address',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '영문주소 변환기',
    description: '한글 주소를 항목별 영문 주소로 즉시 변환. 해외배송·직구 주소 입력이 쉬워져요.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '영문주소 변환기',
  url: 'https://doguham.kr/address',
  description:
    '한글 주소를 항목별 영문 주소로 즉시 변환. 해외배송·직구 주소 입력이 쉬워져요.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  inLanguage: 'ko-KR',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
}

export default function AddressLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
