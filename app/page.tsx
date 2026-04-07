// app/page.tsx
import ToolCard from '@/components/ToolCard'

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-xl font-extrabold text-slate-900 mb-2">
          자주 쓰는 도구 모음
        </h1>
        <p className="text-slate-500 text-sm">업무와 일상에서 바로 쓸 수 있는 도구들</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ToolCard
          icon="🗺️"
          title="영문주소 변환기"
          description="한글 주소를 항목별 영문으로 변환. 해외배송·직구 주소 입력이 쉬워져요."
          href="/address"
        />
        <ToolCard
          icon="🧾"
          title="부가세 계산기"
          description="공급가액·합계금액으로 부가세를 바로 계산해요. 세금계산서·견적서에 활용하세요."
          href="/vat"
        />
      </div>
    </div>
  )
}
