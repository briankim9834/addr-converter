import Link from 'next/link'
import ToolTabs from '@/components/ToolTabs'
import VatPageClient from '@/components/vat/VatPageClient'

const VAT_TABS = [
  { label: '🧾 계산기', href: '/vat' },
  { label: '📖 가이드', href: '/vat/guide' },
  { label: '❓ FAQ', href: '/vat/faq' },
]

export default function VatPage() {
  return (
    <>
      <ToolTabs tabs={VAT_TABS} currentPath="/vat" />
      <VatPageClient />
      {/* 크롤러용 서버 렌더링 콘텐츠 */}
      <div className="max-w-lg mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/vat/guide"
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
          >
            <p className="text-sm font-bold text-slate-800 mb-1">📖 사용 가이드</p>
            <p className="text-xs text-slate-500">부가세 계산 방법을 단계별로 설명해요</p>
          </Link>
          <Link
            href="/vat/faq"
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
          >
            <p className="text-sm font-bold text-slate-800 mb-1">❓ 자주 묻는 질문</p>
            <p className="text-xs text-slate-500">공급가액·부가세·세금계산서 관련 FAQ</p>
          </Link>
        </div>
      </div>
    </>
  )
}
