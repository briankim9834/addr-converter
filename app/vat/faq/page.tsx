import type { Metadata } from 'next'
import Link from 'next/link'
import ToolTabs from '@/components/ToolTabs'

export const metadata: Metadata = {
  title: '부가세 계산기 자주 묻는 질문 (FAQ) — 도구함',
  description:
    '부가세율, 공급가액과 합계금액의 차이, 간이과세자 적용 여부 등 부가세 계산기에 관한 자주 묻는 질문에 답합니다.',
  alternates: { canonical: 'https://doguham.kr/vat/faq' },
  openGraph: {
    title: '부가세 계산기 자주 묻는 질문 (FAQ)',
    description: '부가세 계산기 관련 자주 묻는 질문 모음.',
    url: 'https://doguham.kr/vat/faq',
  },
}

const VAT_TABS = [
  { label: '🧾 계산기', href: '/vat' },
  { label: '📖 가이드', href: '/vat/guide' },
  { label: '❓ FAQ', href: '/vat/faq' },
]

const faqs = [
  {
    q: '부가세율은 항상 10%인가요?',
    a: '일반 과세자 기준 10%입니다. 이 계산기는 10% 기준으로 계산합니다. 간이과세자나 면세사업자의 경우 적용 세율이 다를 수 있으며, 해당 경우에는 세무사 등 전문가에게 확인하시길 권장합니다.',
  },
  {
    q: '공급가액과 합계금액의 차이는 무엇인가요?',
    a: '공급가액은 부가세를 제외한 금액이고, 합계금액(또는 공급대가)은 부가세가 포함된 실제 결제 금액입니다. 세금계산서에는 공급가액과 세액(부가세)을 분리해서 기재합니다.',
  },
  {
    q: '간이과세자도 이 계산기를 쓸 수 있나요?',
    a: '이 계산기는 일반 과세자 기준 10% 부가세율로 계산합니다. 간이과세자는 업종에 따라 부가가치율이 다르게 적용되므로, 참고용으로만 사용하시고 정확한 세액은 세무 전문가에게 확인하세요.',
  },
  {
    q: '합계금액에서 공급가액을 역산하는 방법은?',
    a: '"합계금액 → 부가세" 탭을 선택하고 합계금액을 입력하면 자동으로 공급가액과 부가세를 역산합니다. 계산식은 공급가액 = 합계금액 ÷ 1.1이며, 원 단위로 반올림 처리됩니다.',
  },
  {
    q: '계산 결과를 어떻게 복사하나요?',
    a: '각 항목(공급가액, 부가세, 합계금액) 오른쪽의 복사 버튼을 클릭하면 해당 숫자가 클립보드에 복사됩니다. 콤마와 "원" 단위 없이 숫자만 복사되어 다른 곳에 바로 붙여넣기 편합니다.',
  },
  {
    q: '소수점은 어떻게 처리되나요?',
    a: '원 단위로 반올림하여 계산합니다. 예를 들어 합계금액 100원의 공급가액은 100 ÷ 1.1 = 90.909...원으로 반올림하여 91원, 부가세는 100 - 91 = 9원으로 처리됩니다.',
  },
  {
    q: '부가세 면세 품목은 어떻게 계산하나요?',
    a: '이 계산기는 과세 거래(10% 부가세)만 지원합니다. 농산물, 의료비, 교육비 등 면세 품목은 부가세가 없으므로 공급가액 = 합계금액이 됩니다.',
  },
  {
    q: '계산 결과가 1원 차이 나는 이유는?',
    a: '합계금액 기준 역산 시 공급가액(합계 ÷ 1.1)에서 소수점이 발생할 수 있습니다. 원 단위 반올림으로 인해 부가세와 공급가액의 합계가 입력한 합계금액과 1원 차이가 날 수 있습니다. 실무에서도 이러한 1원 오차는 일반적으로 허용됩니다.',
  },
  {
    q: '세금계산서 작성 시 어떤 금액을 입력해야 하나요?',
    a: '세금계산서의 "공급가액" 칸에는 부가세 제외 금액을, "세액" 칸에는 부가세 금액을 입력합니다. 이 계산기의 "공급가액 → 부가세" 모드로 계산하면 각 칸에 입력할 값을 바로 확인할 수 있습니다.',
  },
  {
    q: '이 계산기는 무료인가요?',
    a: '네, 도구함의 부가세 계산기는 완전 무료입니다. 회원가입이나 로그인 없이 누구나 무제한으로 사용할 수 있습니다.',
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

export default function VatFaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolTabs tabs={VAT_TABS} currentPath="/vat/faq" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          자주 묻는 질문
        </h1>
        <p className="text-slate-500 text-sm mb-8">부가세 계산기 관련 FAQ</p>

        <dl className="space-y-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-white border border-slate-200 rounded-xl p-5">
              <dt className="font-bold text-slate-800 text-sm mb-2">Q. {q}</dt>
              <dd className="text-slate-600 text-sm leading-relaxed">{a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 text-center">
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
