// app/address/faq/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import ToolTabs from '@/components/ToolTabs'

export const metadata: Metadata = {
  title: '영문주소 변환 자주 묻는 질문 (FAQ) — 도구함',
  description:
    '영문주소 변환기 사용법, 아마존·알리익스프레스·몰테일 주소 입력 방법 등 자주 묻는 질문에 답합니다.',
  alternates: { canonical: 'https://doguham.kr/address/faq' },
  openGraph: {
    title: '영문주소 변환 자주 묻는 질문 (FAQ)',
    description: '영문주소 변환기 사용법과 해외직구 영문주소 입력 방법을 안내합니다.',
    url: 'https://doguham.kr/address/faq',
  },
}

const faqs = [
  {
    q: '영문주소 변환기가 무엇인가요?',
    a: '한글 도로명 주소를 해외 배송에 사용할 수 있는 영문 주소로 변환해주는 무료 도구입니다. Address Line 1/2, City, State, ZIP Code 등 항목별로 변환된 결과를 복사해 아마존, 알리익스프레스, 몰테일 등에 바로 붙여넣을 수 있습니다.',
  },
  {
    q: '무료로 사용할 수 있나요?',
    a: '네, 완전 무료입니다. 회원가입 없이 바로 사용할 수 있습니다.',
  },
  {
    q: 'Address Line 1과 Address Line 2에 각각 뭘 입력하나요?',
    a: 'Address Line 1에는 건물번호와 도로명이 들어갑니다. 예) 27 Dokseodang-ro. Address Line 2에는 동·호수·건물명 등 상세주소가 들어갑니다. 예) 101 Dong 1003 Ho, Heliocity.',
  },
  {
    q: 'City와 State에 뭘 입력해야 하나요?',
    a: 'City에는 구(區) 단위가 들어갑니다. 예) Yongsan-gu, Gangnam-gu. State에는 시·도 단위가 들어갑니다. 예) Seoul, Gyeonggi-do. 도구함 영문주소 변환기가 자동으로 올바른 값을 채워드립니다.',
  },
  {
    q: '아마존에서 한국 주소를 영문으로 입력하는 방법은?',
    a: '아마존 배송지 입력 시 Country를 South Korea로 선택한 후, Street Address 1에 Address Line 1, Street Address 2에 Address Line 2, City에 City, State/Province/Region에 State, ZIP/Postal Code에 ZIP Code를 입력하세요.',
  },
  {
    q: '알리익스프레스 영문주소 입력 방법은?',
    a: '알리익스프레스 배송지에서 Address Line 1, Address Line 2, City, Province/State, Zip Code 순서로 입력하면 됩니다. Country는 South Korea를 선택하세요.',
  },
  {
    q: '몰테일 영문주소 입력 방법은?',
    a: '몰테일 수령지 등록 시 도로명주소(영문)에 Address Line 1, 상세주소(영문)에 Address Line 2, 시/도(영문)에 State, 우편번호에 ZIP Code를 입력하세요.',
  },
  {
    q: '변환 결과가 정확한가요?',
    a: '도로명 주소는 행정안전부 공식 영문 주소 API를 사용하여 변환합니다. 상세주소(동·호수)는 AI 번역을 사용하므로 결과를 확인 후 필요시 수정하여 사용하세요.',
  },
  {
    q: '상세주소(동/호수)는 어떻게 입력하나요?',
    a: '상세주소 입력란에 "101동 1003호" 또는 "헬리오시티 101동 1003호"처럼 한글로 입력하면 자동으로 영문으로 번역됩니다.',
  },
  {
    q: '아파트 동/호수를 영문으로 어떻게 쓰나요?',
    a: '아파트 동/호수는 "101 Dong 1003 Ho" 형식으로 표기됩니다. 건물명이 있는 경우 "Heliocity Apt 101 Dong 1003 Ho"처럼 건물명이 앞에 옵니다. 도구함 변환기가 자동으로 변환해드립니다.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

const ADDRESS_TABS = [
  { label: '🗺️ 변환기', href: '/address' },
  { label: '📖 가이드', href: '/address/guide' },
  { label: '❓ FAQ', href: '/address/faq' },
]

export default function FaqPage() {
  return (
    <>
      <ToolTabs tabs={ADDRESS_TABS} currentPath="/address/faq" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          자주 묻는 질문 (FAQ)
        </h1>
        <p className="text-slate-500 text-sm mb-10">
          영문주소 변환기 사용법과 해외직구 영문주소 입력 방법을 안내합니다.
        </p>

        <div className="grid gap-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-white border border-slate-200 rounded-xl px-5 py-4">
              <p className="font-bold text-slate-800 mb-2">Q. {q}</p>
              <p className="text-sm text-slate-600 leading-relaxed">A. {a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="font-bold text-slate-800 mb-1">지금 바로 변환해보세요</p>
          <p className="text-sm text-slate-500 mb-4">무료로 사용할 수 있어요</p>
          <Link
            href="/address"
            className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            🗺️ 영문주소 변환하기
          </Link>
        </div>
      </div>
    </>
  )
}
