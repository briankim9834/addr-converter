// app/page.tsx
import ToolCard from '@/components/ToolCard'

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-xl font-extrabold text-indigo-950 mb-2">
          자주 쓰는 유틸 도구 모음
        </h1>
        <p className="text-gray-500 text-sm">업무와 일상에서 바로 쓸 수 있는 도구들</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ToolCard
          icon="🗺️"
          title="영문주소 변환기"
          description="한글 주소를 항목별 영문으로 변환. 해외배송·직구 주소 입력이 쉬워져요."
          href="/address"
        />
        <div className="bg-white/50 rounded-xl p-5 border-2 border-dashed border-violet-200 flex flex-col items-center justify-center text-center min-h-[160px]">
          <div className="text-2xl mb-2 text-violet-300">➕</div>
          <p className="text-violet-300 text-xs">도구 추가 예정</p>
        </div>
      </div>
    </div>
  )
}
