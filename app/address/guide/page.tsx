// app/address/guide/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '영문주소 변환기 사용 가이드 — 해외배송·직구 영문주소 만들기',
  description:
    '아마존, 알리익스프레스, 몰테일 등 해외배송·직구 시 영문주소 입력 방법을 단계별로 설명합니다. 도구함 영문주소 변환기로 3단계 만에 완성하세요.',
  alternates: { canonical: 'https://doguham.kr/address/guide' },
  openGraph: {
    title: '영문주소 변환기 사용 가이드',
    description: '해외배송·직구 영문주소 입력 방법을 단계별로 설명합니다.',
    url: 'https://doguham.kr/address/guide',
  },
}

export default function GuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
        영문주소 변환기 사용 가이드
      </h1>
      <p className="text-slate-500 text-sm mb-10">
        해외배송·직구 시 영문주소 입력이 어려우셨나요? 도구함 영문주소 변환기로 3단계 만에 해결하세요.
      </p>

      {/* 영문주소가 필요한 상황 */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-800 mb-3">영문주소가 필요한 경우</h2>
        <ul className="grid gap-2 text-sm text-slate-600">
          {[
            { icon: '🛒', text: '아마존(Amazon) 해외 직구 배송지 등록' },
            { icon: '🛍️', text: '알리익스프레스(AliExpress) 주소 입력' },
            { icon: '📦', text: '몰테일, 배대지 수령지 주소 등록' },
            { icon: '✈️', text: '해외 쇼핑몰 배송지 입력' },
          ].map(({ icon, text }) => (
            <li key={text} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-3">
              <span>{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 영문주소 구성 요소 */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-800 mb-3">영문주소 구성 요소</h2>
        <div className="grid gap-2 text-sm">
          {[
            { field: 'Address Line 1', desc: '건물번호 + 도로명. 예) 27 Dokseodang-ro' },
            { field: 'Address Line 2', desc: '동·호수·건물명(상세주소). 예) 101 Dong 1003 Ho' },
            { field: 'City', desc: '구(區) 단위. 예) Yongsan-gu' },
            { field: 'State / Province', desc: '시·도 단위. 예) Seoul, Gyeonggi-do' },
            { field: 'ZIP Code', desc: '5자리 우편번호. 예) 04410' },
            { field: 'Country', desc: 'South Korea (고정)' },
          ].map(({ field, desc }) => (
            <div key={field} className="flex gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3">
              <span className="font-bold text-blue-600 w-40 flex-shrink-0">{field}</span>
              <span className="text-slate-600">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3단계 사용법 */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-800 mb-3">3단계 사용법</h2>
        <ol className="grid gap-3 text-sm">
          {[
            { step: '1', title: '도로명 주소 검색', desc: '검색창을 클릭해 카카오 주소 검색으로 도로명 주소를 선택하세요.' },
            { step: '2', title: '상세주소 입력', desc: '동·호수·건물명을 한글로 입력하면 자동으로 영문으로 번역됩니다.' },
            { step: '3', title: '항목별 복사', desc: '변환된 Address Line 1/2, City, State, ZIP Code를 항목별로 복사해 붙여넣으세요.' },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex gap-4 bg-white border border-slate-200 rounded-lg px-4 py-3">
              <span className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm">{step}</span>
              <div>
                <p className="font-bold text-slate-800 mb-0.5">{title}</p>
                <p className="text-slate-500">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 사이트별 입력 가이드 */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-800 mb-3">사이트별 입력 가이드</h2>
        <div className="grid gap-4 text-sm">
          {[
            {
              site: '🛒 Amazon',
              fields: ['Address Line 1 → Street Address 1', 'Address Line 2 → Street Address 2', 'City → City', 'State → State/Province/Region', 'ZIP Code → ZIP/Postal Code', 'Country → South Korea 선택'],
            },
            {
              site: '🛍️ AliExpress',
              fields: ['Address Line 1 → Address Line 1', 'Address Line 2 → Address Line 2', 'City → City', 'State → Province/State', 'ZIP Code → Zip Code'],
            },
            {
              site: '📦 몰테일',
              fields: ['Address Line 1 → 도로명주소(영문)', 'Address Line 2 → 상세주소(영문)', 'State → 시/도(영문)', 'ZIP Code → 우편번호'],
            },
          ].map(({ site, fields }) => (
            <div key={site} className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="font-bold text-slate-800 mb-2">{site}</p>
              <ul className="grid gap-1">
                {fields.map((f) => (
                  <li key={f} className="text-slate-500 text-xs flex items-center gap-1">
                    <span className="text-blue-400">→</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
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
  )
}
