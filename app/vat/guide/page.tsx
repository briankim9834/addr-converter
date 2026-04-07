import type { Metadata } from 'next'
import Link from 'next/link'
import ToolTabs from '@/components/ToolTabs'

export const metadata: Metadata = {
  title: '부가세 계산기 사용 가이드 — 공급가액·합계금액 계산법',
  description:
    '부가세(VAT) 계산 방법을 단계별로 설명합니다. 공급가액과 합계금액의 차이, 세금계산서 작성 시 활용법까지 안내해드려요.',
  alternates: { canonical: 'https://doguham.kr/vat/guide' },
  openGraph: {
    title: '부가세 계산기 사용 가이드',
    description: '공급가액과 합계금액 기준 부가세 계산 방법을 단계별로 설명합니다.',
    url: 'https://doguham.kr/vat/guide',
  },
}

const VAT_TABS = [
  { label: '🧾 계산기', href: '/vat' },
  { label: '📖 가이드', href: '/vat/guide' },
  { label: '❓ FAQ', href: '/vat/faq' },
]

export default function VatGuidePage() {
  return (
    <>
      <ToolTabs tabs={VAT_TABS} currentPath="/vat/guide" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          부가세 계산기 사용 가이드
        </h1>
        <p className="text-slate-500 text-sm mb-10">
          공급가액·합계금액 기준 부가세 계산 방법을 단계별로 안내해드려요.
        </p>

        {/* Section 1: 부가세란 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-800 mb-3">부가세(VAT)란?</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            부가가치세(VAT, Value Added Tax)는 상품이나 서비스를 거래할 때 붙는 세금으로,
            우리나라 일반 과세자 기준 <strong>10%</strong>가 적용됩니다.
            예를 들어 공급가액이 100,000원이라면 부가세 10,000원이 붙어
            합계금액은 110,000원이 됩니다.
          </p>
        </section>

        {/* Section 2: 공급가액 vs 합계금액 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-800 mb-3">공급가액 vs 합계금액 차이</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase">공급가액</p>
              <p className="text-sm text-slate-700 font-semibold mb-1">부가세 제외 금액</p>
              <p className="text-xs text-slate-500">세금계산서의 "공급가액" 칸에 적는 금액. 부가세를 더하기 전 금액.</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-400 mb-1 uppercase">합계금액</p>
              <p className="text-sm text-blue-700 font-semibold mb-1">부가세 포함 금액</p>
              <p className="text-xs text-blue-500">실제로 결제하는 금액. 공급가액 + 부가세.</p>
            </div>
          </div>
        </section>

        {/* Section 3: 사용법 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-800 mb-4">3단계 사용법</h2>
          <ol className="space-y-4">
            {[
              { step: 1, title: '계산 방식 선택', desc: '공급가액을 알고 있으면 "공급가액 → 부가세", 합계금액을 알고 있으면 "합계금액 → 부가세" 탭을 선택하세요.' },
              { step: 2, title: '금액 입력', desc: '금액을 입력하면 부가세와 나머지 금액이 자동으로 계산됩니다. 별도 버튼 클릭 없이 즉시 계산돼요.' },
              { step: 3, title: '결과 복사', desc: '공급가액, 부가세, 합계금액 옆 복사 버튼을 눌러 숫자를 바로 복사할 수 있습니다.' },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {step}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm mb-1">{title}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Section 4: 활용 예시 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-800 mb-4">이런 상황에서 활용하세요</h2>
          <ul className="space-y-3">
            {[
              { icon: '🧾', title: '세금계산서 작성', desc: '공급가액과 부가세를 정확히 분리해 세금계산서에 입력할 때' },
              { icon: '📋', title: '견적서 작성', desc: '공급가액 기준 견적서에 부가세 포함 합계금액을 표기할 때' },
              { icon: '💼', title: '프리랜서 계약', desc: '계약 금액이 부가세 포함인지 제외인지 확인하고 역산할 때' },
              { icon: '🛒', title: '사업자 구매', desc: '매입 세금계산서 수취 시 공급가액과 세액을 분리 확인할 때' },
            ].map(({ icon, title, desc }) => (
              <li key={title} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className="bg-blue-50 rounded-2xl p-6 text-center">
          <p className="text-slate-700 font-bold mb-1">지금 바로 계산해보세요</p>
          <p className="text-slate-500 text-sm mb-4">숫자를 입력하면 즉시 계산됩니다</p>
          <Link
            href="/vat"
            className="inline-block bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-colors text-sm"
          >
            부가세 계산기 바로가기 →
          </Link>
        </div>
      </div>
    </>
  )
}
