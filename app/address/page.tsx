// app/address/page.tsx
import Link from 'next/link'
import AddressPageClient from '@/components/address/AddressPageClient'

export default function AddressPage() {
  return (
    <>
      <AddressPageClient />

      {/* 크롤러용 서버 렌더링 콘텐츠 */}
      <div className="max-w-lg mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/address/guide"
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
          >
            <p className="text-sm font-bold text-slate-800 mb-1">📖 사용 가이드</p>
            <p className="text-xs text-slate-500">영문주소 변환 방법을 단계별로 설명해요</p>
          </Link>
          <Link
            href="/address/faq"
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
          >
            <p className="text-sm font-bold text-slate-800 mb-1">❓ 자주 묻는 질문</p>
            <p className="text-xs text-slate-500">아마존·알리·몰테일 입력 방법 안내</p>
          </Link>
        </div>
      </div>
    </>
  )
}
