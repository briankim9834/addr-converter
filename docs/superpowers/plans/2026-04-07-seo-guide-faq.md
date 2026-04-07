# SEO 가이드/FAQ 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 구글 상위 노출을 위한 서버 컴포넌트 기반 가이드/FAQ 페이지 추가 및 기존 주소 변환 페이지 서버/클라이언트 분리

**Architecture:** `app/address/page.tsx`의 클라이언트 로직을 `AddressPageClient`로 분리해 서버 컴포넌트 래퍼가 크롤 가능한 콘텐츠를 노출하도록 한다. 가이드/FAQ 페이지는 순수 서버 컴포넌트로 작성하고, FAQ 페이지에는 JSON-LD 구조화 데이터를 포함시킨다.

**Tech Stack:** Next.js 14 App Router (서버 컴포넌트), TypeScript, Tailwind CSS

---

### Task 1: AddressPageClient 분리

**Files:**
- Create: `components/address/AddressPageClient.tsx`
- Modify: `app/address/page.tsx`

- [ ] **Step 1: `AddressPageClient.tsx` 생성**

`app/address/page.tsx`의 전체 클라이언트 로직을 새 파일로 이동한다.

```tsx
// components/address/AddressPageClient.tsx
'use client'

import { useState } from 'react'
import { ParsedAddress, SelectedAddress } from '@/types/address'
import { parseEngAddr, formatFullAddress } from '@/lib/address'
import AddressSearch from '@/components/address/AddressSearch'
import DetailInput from '@/components/address/DetailInput'
import ResultSection from '@/components/address/ResultSection'
import SiteGuide from '@/components/address/SiteGuide'

type Step = 'search' | 'detail' | 'result'

export default function AddressPageClient() {
  const [step, setStep] = useState<Step>('search')
  const [selected, setSelected] = useState<SelectedAddress | null>(null)
  const [detailKorean, setDetailKorean] = useState('')
  const [parsedAddress, setParsedAddress] = useState<ParsedAddress | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  function handleReset() {
    setStep('search')
    setSelected(null)
    setDetailKorean('')
    setParsedAddress(null)
  }

  function handleSelect(address: SelectedAddress) {
    setSelected(address)
    setStep('detail')
  }

  async function translateDetail(korean: string): Promise<string> {
    if (!korean.trim()) return ''
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: korean }),
      })
      if (!res.ok) return korean
      const data = await res.json()
      return data.translatedText ?? korean
    } catch {
      return korean
    }
  }

  async function handleConvert(detail: string = detailKorean) {
    if (!selected) return
    setIsConverting(true)
    try {
      const jusoRes = await fetch(
        `/api/juso?keyword=${encodeURIComponent(selected.korean)}`
      )
      if (!jusoRes.ok) throw new Error('JUSO API 오류')
      const jusoData = await jusoRes.json()
      if (!jusoData.juso?.length) {
        alert('주소 변환 결과를 찾을 수 없어요. 다시 검색해주세요.')
        return
      }
      const base = parseEngAddr(jusoData.juso[0])
      const addressLine2 = detail.trim() ? await translateDetail(detail) : ''
      const final: ParsedAddress = {
        ...base,
        addressLine2,
        fullAddress: formatFullAddress({ ...base, addressLine2 }),
      }
      setParsedAddress(final)
      setStep('result')
    } catch {
      alert('주소 변환에 실패했어요. 다시 시도해주세요.')
    } finally {
      setIsConverting(false)
    }
  }

  async function handleReconvert(detail: string) {
    await handleConvert(detail)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900 mb-1">
          🗺️ 영문주소 변환기
        </h1>
        <p className="text-sm text-slate-500">해외배송·직구 주소 입력이 쉬워져요</p>
      </div>

      {step !== 'result' && (
        <div className="grid gap-3 mb-4">
          <AddressSearch
            selected={selected}
            onSelect={handleSelect}
            onReset={handleReset}
          />
          {step === 'detail' && selected && (
            <>
              <DetailInput onChange={setDetailKorean} />
              <button
                onClick={() => handleConvert(detailKorean)}
                disabled={isConverting}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                {isConverting ? '변환 중...' : '🗺️ 영문 주소로 변환하기'}
              </button>
            </>
          )}
          {step === 'search' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-slate-500 leading-6">
              💡 <strong className="text-slate-700">이렇게 사용하세요</strong>
              <br />
              1. 위 검색창을 눌러 도로명 주소를 검색하세요
              <br />
              2. 동·호수·건물명을 상세주소에 입력하세요
              <br />
              3. 항목별 복사 버튼으로 바로 사용하세요
            </div>
          )}
        </div>
      )}

      {step === 'result' && parsedAddress && selected && (
        <>
          <ResultSection
            address={parsedAddress}
            selected={selected}
            onReset={handleReset}
            onReconvert={handleReconvert}
            isConverting={isConverting}
          />
          <SiteGuide address={parsedAddress} />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: `app/address/page.tsx`를 서버 컴포넌트 래퍼로 교체**

```tsx
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
```

- [ ] **Step 3: 로컬에서 동작 확인**

```bash
cd ~/addr-converter && npm run dev
```

브라우저에서 `http://localhost:3000/address` 접속 → 기존 기능 정상 동작 확인, 하단에 가이드/FAQ 링크 카드 노출 확인.

- [ ] **Step 4: 커밋**

```bash
cd ~/addr-converter
git add components/address/AddressPageClient.tsx app/address/page.tsx
git commit -m "feat: address 페이지 서버/클라이언트 분리, 가이드·FAQ 링크 추가"
```

---

### Task 2: 사용 가이드 페이지 생성

**Files:**
- Create: `app/address/guide/page.tsx`

- [ ] **Step 1: `app/address/guide/page.tsx` 생성**

```tsx
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
```

- [ ] **Step 2: 로컬에서 확인**

`http://localhost:3000/address/guide` 접속 → 페이지 정상 렌더링, 전체 섹션 표시 확인.

- [ ] **Step 3: 커밋**

```bash
cd ~/addr-converter
git add app/address/guide/page.tsx
git commit -m "feat: 영문주소 변환기 사용 가이드 페이지 추가"
```

---

### Task 3: FAQ 페이지 생성

**Files:**
- Create: `app/address/faq/page.tsx`

- [ ] **Step 1: `app/address/faq/page.tsx` 생성**

```tsx
// app/address/faq/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

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

export default function FaqPage() {
  return (
    <>
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
```

- [ ] **Step 2: 로컬에서 확인**

`http://localhost:3000/address/faq` 접속 → 10개 FAQ 항목 정상 렌더링, 페이지 소스에 `application/ld+json` 스크립트 포함 확인.

- [ ] **Step 3: 커밋**

```bash
cd ~/addr-converter
git add app/address/faq/page.tsx
git commit -m "feat: FAQ 페이지 추가 (JSON-LD 구조화 데이터 포함)"
```

---

### Task 4: 헤더 네비게이션 업데이트

**Files:**
- Modify: `components/Header.tsx`

- [ ] **Step 1: Header에 가이드/FAQ 링크 추가**

```tsx
// components/Header.tsx
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="text-blue-600 font-extrabold text-base leading-tight tracking-tight">
            ⚡ 도구함
          </span>
          <span className="text-slate-400 text-xs">직장인을 위한 실용 도구들</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/address" className="text-slate-600 text-sm hover:text-blue-600 transition-colors">
            영문주소 변환
          </Link>
          <Link href="/address/guide" className="text-slate-600 text-sm hover:text-blue-600 transition-colors">
            가이드
          </Link>
          <Link href="/address/faq" className="text-slate-600 text-sm hover:text-blue-600 transition-colors">
            FAQ
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: 로컬에서 확인**

모든 페이지에서 헤더에 "영문주소 변환 / 가이드 / FAQ" 링크 표시 확인. 각 링크 클릭 시 정상 이동 확인.

- [ ] **Step 3: 커밋**

```bash
cd ~/addr-converter
git add components/Header.tsx
git commit -m "feat: 헤더에 가이드·FAQ 네비게이션 링크 추가"
```

---

### Task 5: sitemap 업데이트 및 배포

**Files:**
- Modify: `app/sitemap.ts`

- [ ] **Step 1: sitemap에 새 페이지 추가**

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://doguham.kr',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://doguham.kr/address',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://doguham.kr/address/guide',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://doguham.kr/address/faq',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
```

- [ ] **Step 2: 빌드 오류 확인**

```bash
cd ~/addr-converter && npm run build
```

Expected: 빌드 성공, 오류 없음.

- [ ] **Step 3: 커밋 및 push**

```bash
cd ~/addr-converter
git add app/sitemap.ts
git commit -m "feat: sitemap에 가이드·FAQ 페이지 추가"
git push origin main
```

- [ ] **Step 4: 배포 확인**

Vercel 자동 배포 완료 후:
- `https://doguham.kr/address/guide` 정상 접속
- `https://doguham.kr/address/faq` 정상 접속
- `https://doguham.kr/sitemap.xml` 에 새 URL 4개 포함 확인

- [ ] **Step 5: Google Search Console에 sitemap 재제출**

Google Search Console → Sitemaps → `https://doguham.kr/sitemap.xml` 재제출
