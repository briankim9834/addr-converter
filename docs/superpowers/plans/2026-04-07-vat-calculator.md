# 부가세 계산기 + 네비게이션 개편 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 부가세 계산기(/vat) 추가 및 헤더를 햄버거+사이드바로 개편, 모든 도구 페이지에 Pill 탭(계산기|가이드|FAQ) 적용

**Architecture:** 계산 로직은 순수 함수(lib/vat.ts)로 분리해 단위 테스트. UI는 'use client' VatPageClient가 담당. 공통 컴포넌트(ToolTabs, HamburgerMenu)를 먼저 만들고 각 도구 페이지에 적용. 서버 컴포넌트 wrapper 패턴으로 SEO 크롤러 접근성 확보.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Jest + React Testing Library

**Working Directory:** `/Users/sunwookim/addr-converter`

---

## 파일 구조

| 파일 | 유형 | 역할 |
|------|------|------|
| `lib/vat.ts` | 신규 | VAT 계산 순수 함수 |
| `__tests__/lib/vat.test.ts` | 신규 | VAT 계산 단위 테스트 |
| `components/ToolTabs.tsx` | 신규 | 공통 Pill 탭 컴포넌트 (서버) |
| `components/HamburgerMenu.tsx` | 신규 | 사이드바 드로어 (use client) |
| `components/Header.tsx` | 수정 | 텍스트 링크 제거 → HamburgerMenu |
| `app/page.tsx` | 수정 | 부가세 계산기 ToolCard 추가 |
| `app/address/page.tsx` | 수정 | ToolTabs 적용, 하단 카드 제거 |
| `app/address/guide/page.tsx` | 수정 | ToolTabs 추가 |
| `app/address/faq/page.tsx` | 수정 | ToolTabs 추가 |
| `components/vat/VatPageClient.tsx` | 신규 | 계산기 UI (use client) |
| `app/vat/layout.tsx` | 신규 | SEO 메타데이터 |
| `app/vat/page.tsx` | 신규 | 서버 컴포넌트 wrapper |
| `app/vat/guide/page.tsx` | 신규 | 가이드 서버 컴포넌트 |
| `app/vat/faq/page.tsx` | 신규 | FAQ + FAQPage JSON-LD |
| `app/sitemap.ts` | 수정 | /vat, /vat/guide, /vat/faq 추가 |

---

## Task 1: VAT 계산 로직 (lib/vat.ts)

**Files:**
- Create: `lib/vat.ts`
- Create: `__tests__/lib/vat.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

```ts
// __tests__/lib/vat.test.ts
import { calcFromSupply, calcFromTotal, formatKRW, parseInput } from '@/lib/vat'

describe('calcFromSupply', () => {
  it('공급가액에서 부가세와 합계를 계산한다', () => {
    expect(calcFromSupply(1000000)).toEqual({
      supply: 1000000,
      vat: 100000,
      total: 1100000,
    })
  })
  it('소수점이 나올 경우 원 단위로 반올림한다', () => {
    const result = calcFromSupply(100)
    expect(result.vat).toBe(10)
    expect(result.total).toBe(110)
  })
  it('0 입력 시 모두 0을 반환한다', () => {
    expect(calcFromSupply(0)).toEqual({ supply: 0, vat: 0, total: 0 })
  })
})

describe('calcFromTotal', () => {
  it('합계금액에서 공급가액과 부가세를 역산한다', () => {
    expect(calcFromTotal(1100000)).toEqual({
      supply: 1000000,
      vat: 100000,
      total: 1100000,
    })
  })
  it('나누어 떨어지지 않을 경우 공급가액을 반올림하고 부가세는 차감으로 계산한다', () => {
    // 100 / 1.1 = 90.909... → 91, vat = 100 - 91 = 9
    const result = calcFromTotal(100)
    expect(result.supply).toBe(91)
    expect(result.vat).toBe(9)
    expect(result.total).toBe(100)
  })
  it('0 입력 시 모두 0을 반환한다', () => {
    expect(calcFromTotal(0)).toEqual({ supply: 0, vat: 0, total: 0 })
  })
})

describe('formatKRW', () => {
  it('천 단위 콤마로 포맷한다', () => {
    expect(formatKRW(1000000)).toBe('1,000,000')
  })
  it('소수점은 반올림한다', () => {
    expect(formatKRW(1000.6)).toBe('1,001')
  })
})

describe('parseInput', () => {
  it('콤마를 제거하고 숫자로 파싱한다', () => {
    expect(parseInput('1,000,000')).toBe(1000000)
  })
  it('빈 문자열은 0을 반환한다', () => {
    expect(parseInput('')).toBe(0)
  })
  it('숫자가 아닌 문자열은 0을 반환한다', () => {
    expect(parseInput('abc')).toBe(0)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd /Users/sunwookim/addr-converter && npm test -- --testPathPattern="lib/vat" --watchAll=false 2>&1 | tail -10
```

Expected: FAIL — `Cannot find module '@/lib/vat'`

- [ ] **Step 3: lib/vat.ts 구현**

```ts
// lib/vat.ts

export interface VatResult {
  supply: number
  vat: number
  total: number
}

export function calcFromSupply(supply: number): VatResult {
  const vat = Math.round(supply * 0.1)
  const total = supply + vat
  return { supply, vat, total }
}

export function calcFromTotal(total: number): VatResult {
  const supply = Math.round(total / 1.1)
  const vat = total - supply
  return { supply, vat, total }
}

export function formatKRW(n: number): string {
  return Math.round(n).toLocaleString('ko-KR')
}

export function parseInput(value: string): number {
  return parseFloat(value.replace(/,/g, '')) || 0
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd /Users/sunwookim/addr-converter && npm test -- --testPathPattern="lib/vat" --watchAll=false 2>&1 | tail -10
```

Expected: PASS — 10 tests passed

- [ ] **Step 5: 커밋**

```bash
cd /Users/sunwookim/addr-converter && git add lib/vat.ts __tests__/lib/vat.test.ts && git commit -m "feat: VAT 계산 순수 함수 추가 (lib/vat.ts)"
```

---

## Task 2: ToolTabs 공통 Pill 탭 컴포넌트

**Files:**
- Create: `components/ToolTabs.tsx`

- [ ] **Step 1: ToolTabs 컴포넌트 작성**

```tsx
// components/ToolTabs.tsx
import Link from 'next/link'

interface Tab {
  label: string
  href: string
}

interface ToolTabsProps {
  tabs: Tab[]
  currentPath: string
}

export default function ToolTabs({ tabs, currentPath }: ToolTabsProps) {
  return (
    <div className="flex gap-2 px-4 pt-4 pb-1">
      {tabs.map((tab) => {
        const isActive = currentPath === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: 빌드 확인**

```bash
cd /Users/sunwookim/addr-converter && npm run build 2>&1 | tail -15
```

Expected: 빌드 성공

- [ ] **Step 3: 커밋**

```bash
cd /Users/sunwookim/addr-converter && git add components/ToolTabs.tsx && git commit -m "feat: 공통 Pill 탭 컴포넌트 추가 (ToolTabs)"
```

---

## Task 3: HamburgerMenu + Header 개편

**Files:**
- Create: `components/HamburgerMenu.tsx`
- Modify: `components/Header.tsx`

- [ ] **Step 1: HamburgerMenu 컴포넌트 작성**

```tsx
// components/HamburgerMenu.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TOOLS = [
  {
    icon: '🧾',
    name: '부가세 계산기',
    description: '공급가액·합계금액 계산',
    href: '/vat',
    available: true,
  },
  {
    icon: '🗺️',
    name: '영문주소 변환기',
    description: '해외배송·직구 주소 변환',
    href: '/address',
    available: true,
  },
  {
    icon: '📅',
    name: 'D-day 계산기',
    description: '날짜·기간 계산',
    href: '#',
    available: false,
  },
  {
    icon: '💱',
    name: '환율 계산기',
    description: '실시간 환율 변환',
    href: '#',
    available: false,
  },
]

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        aria-label="메뉴 열기"
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center gap-1 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        <span className="block w-4 h-0.5 bg-slate-500 rounded" />
        <span className="block w-4 h-0.5 bg-slate-500 rounded" />
        <span className="block w-4 h-0.5 bg-slate-500 rounded" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-slate-900/35 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 bottom-0 w-56 bg-white z-50 shadow-xl transform transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            도구 선택
          </p>
        </div>
        <ul>
          {TOOLS.map((tool) => {
            const isActive = tool.available && pathname.startsWith(tool.href)
            return (
              <li key={tool.href}>
                {tool.available ? (
                  <Link
                    href={tool.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-slate-50 transition-colors ${
                      isActive ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold leading-tight ${
                          isActive ? 'text-blue-600' : 'text-slate-800'
                        }`}
                      >
                        {tool.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                    {isActive && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold shrink-0">
                        사용중
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 opacity-40 cursor-default">
                    <span className="text-xl">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-tight">
                        {tool.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold shrink-0">
                      준비중
                    </span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Header.tsx 수정**

```tsx
// components/Header.tsx
import Link from 'next/link'
import HamburgerMenu from '@/components/HamburgerMenu'

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
        <HamburgerMenu />
      </div>
    </header>
  )
}
```

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/sunwookim/addr-converter && npm run build 2>&1 | tail -15
```

Expected: 빌드 성공

- [ ] **Step 4: 커밋**

```bash
cd /Users/sunwookim/addr-converter && git add components/HamburgerMenu.tsx components/Header.tsx && git commit -m "feat: 햄버거 메뉴 + 사이드바 드로어 추가, 헤더 개편"
```

---

## Task 4: 홈 + Address 페이지 업데이트

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/address/page.tsx`
- Modify: `app/address/guide/page.tsx`
- Modify: `app/address/faq/page.tsx`

- [ ] **Step 1: 홈 페이지에 부가세 계산기 카드 추가**

```tsx
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
```

- [ ] **Step 2: Address 메인 페이지에 ToolTabs 적용 (하단 카드 제거)**

```tsx
// app/address/page.tsx
import AddressPageClient from '@/components/address/AddressPageClient'
import ToolTabs from '@/components/ToolTabs'

const ADDRESS_TABS = [
  { label: '🗺️ 변환기', href: '/address' },
  { label: '📖 가이드', href: '/address/guide' },
  { label: '❓ FAQ', href: '/address/faq' },
]

export default function AddressPage() {
  return (
    <>
      <ToolTabs tabs={ADDRESS_TABS} currentPath="/address" />
      <AddressPageClient />
    </>
  )
}
```

- [ ] **Step 3: Address guide 페이지에 ToolTabs 추가**

`app/address/guide/page.tsx` 파일을 열고, 기존 `export default function GuidePage()` 의 return 최상단에 ToolTabs를 추가한다. import 두 줄과 상수 추가:

```tsx
// app/address/guide/page.tsx 상단에 추가 (기존 import 아래)
import ToolTabs from '@/components/ToolTabs'

const ADDRESS_TABS = [
  { label: '🗺️ 변환기', href: '/address' },
  { label: '📖 가이드', href: '/address/guide' },
  { label: '❓ FAQ', href: '/address/faq' },
]
```

기존 return 문을 아래와 같이 감싼다:

```tsx
export default function GuidePage() {
  return (
    <>
      <ToolTabs tabs={ADDRESS_TABS} currentPath="/address/guide" />
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* 기존 내용 그대로 유지 */}
      </div>
    </>
  )
}
```

- [ ] **Step 4: Address FAQ 페이지에 ToolTabs 추가**

`app/address/faq/page.tsx` 파일에 동일한 패턴으로 ToolTabs 추가:

```tsx
// app/address/faq/page.tsx 상단에 추가
import ToolTabs from '@/components/ToolTabs'

const ADDRESS_TABS = [
  { label: '🗺️ 변환기', href: '/address' },
  { label: '📖 가이드', href: '/address/guide' },
  { label: '❓ FAQ', href: '/address/faq' },
]
```

기존 return 문을 감싼다:

```tsx
export default function FaqPage() {
  return (
    <>
      <ToolTabs tabs={ADDRESS_TABS} currentPath="/address/faq" />
      {/* 기존 내용 그대로 유지 (script 태그 포함) */}
    </>
  )
}
```

- [ ] **Step 5: 빌드 확인**

```bash
cd /Users/sunwookim/addr-converter && npm run build 2>&1 | tail -15
```

Expected: 빌드 성공

- [ ] **Step 6: 커밋**

```bash
cd /Users/sunwookim/addr-converter && git add app/page.tsx app/address/page.tsx app/address/guide/page.tsx app/address/faq/page.tsx && git commit -m "feat: 홈 부가세 카드 추가, address 페이지 ToolTabs 적용"
```

---

## Task 5: VatPageClient (계산기 UI)

**Files:**
- Create: `components/vat/VatPageClient.tsx`

- [ ] **Step 1: VatPageClient 작성**

```tsx
// components/vat/VatPageClient.tsx
'use client'

import { useState } from 'react'
import { calcFromSupply, calcFromTotal, formatKRW, parseInput, VatResult } from '@/lib/vat'

type Mode = 'supply' | 'total'

const MODE_TABS: { mode: Mode; label: string }[] = [
  { mode: 'supply', label: '공급가액 → 부가세' },
  { mode: 'total', label: '합계금액 → 부가세' },
]

export default function VatPageClient() {
  const [mode, setMode] = useState<Mode>('supply')
  const [inputValue, setInputValue] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const rawNumber = parseInput(inputValue)
  const result: VatResult | null = rawNumber > 0
    ? mode === 'supply'
      ? calcFromSupply(rawNumber)
      : calcFromTotal(rawNumber)
    : null

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/,/g, '')
    if (raw === '' || /^\d+$/.test(raw)) {
      setInputValue(raw ? parseInt(raw, 10).toLocaleString('ko-KR') : '')
    }
  }

  function handleModeChange(newMode: Mode) {
    setMode(newMode)
    setInputValue('')
  }

  async function handleCopy(value: number, key: string) {
    await navigator.clipboard.writeText(String(value))
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  function handleReset() {
    setInputValue('')
  }

  const inputLabel = mode === 'supply' ? '공급가액 입력' : '합계금액 입력'

  const rows: { label: string; key: keyof VatResult; highlight?: boolean }[] = [
    { label: '공급가액', key: 'supply' },
    { label: '부가세 (10%)', key: 'vat' },
    { label: '합계금액', key: 'total', highlight: true },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* 계산 모드 탭 */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
        {MODE_TABS.map(({ mode: m, label }) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === m
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 입력 */}
      <p className="text-xs font-semibold text-slate-500 mb-1.5">{inputLabel}</p>
      <div className="relative mb-5">
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInput}
          placeholder="금액을 입력하세요"
          className="w-full border-2 border-blue-500 rounded-xl px-4 py-3.5 pr-10 text-xl font-extrabold text-slate-900 outline-none placeholder:text-slate-300 placeholder:font-normal placeholder:text-base"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">원</span>
      </div>

      {/* 결과 */}
      <div className="bg-slate-50 rounded-xl overflow-hidden mb-3">
        {rows.map(({ label, key, highlight }) => (
          <div
            key={key}
            className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 ${
              highlight ? 'bg-blue-50' : ''
            }`}
          >
            <span className={`text-sm ${highlight ? 'font-bold text-blue-900' : 'text-slate-600'}`}>
              {label}
            </span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${highlight ? 'text-blue-600 text-base' : 'text-slate-800 text-sm'}`}>
                {result ? `${formatKRW(result[key])} 원` : '—'}
              </span>
              {result && (
                <button
                  onClick={() => handleCopy(result[key], key)}
                  className={`text-xs px-2 py-1 rounded-md font-semibold transition-colors ${
                    copied === key
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                  }`}
                >
                  {copied === key ? '복사됨' : '복사'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 초기화 */}
      <button
        onClick={handleReset}
        className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm font-semibold hover:bg-slate-200 transition-colors"
      >
        초기화
      </button>
    </div>
  )
}
```

- [ ] **Step 2: 빌드 확인**

```bash
cd /Users/sunwookim/addr-converter && npm run build 2>&1 | tail -15
```

Expected: 빌드 성공

- [ ] **Step 3: 커밋**

```bash
cd /Users/sunwookim/addr-converter && git add components/vat/VatPageClient.tsx && git commit -m "feat: 부가세 계산기 UI 컴포넌트 추가 (VatPageClient)"
```

---

## Task 6: /vat 페이지 (layout + server wrapper)

**Files:**
- Create: `app/vat/layout.tsx`
- Create: `app/vat/page.tsx`

- [ ] **Step 1: app/vat/layout.tsx 작성**

```tsx
// app/vat/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '부가세 계산기 — 공급가액·합계금액 자동 계산',
  description:
    '공급가액 또는 합계금액을 입력하면 부가세(10%)를 자동으로 계산해드립니다. 세금계산서 작성, 견적서 정리에 바로 활용하세요.',
  keywords: ['부가세계산기', '부가세 계산', '공급가액 계산', '합계금액 부가세', '세금계산서', '부가가치세'],
  alternates: { canonical: 'https://doguham.kr/vat' },
  openGraph: {
    title: '부가세 계산기 — 공급가액·합계금액 자동 계산',
    description: '공급가액 또는 합계금액을 입력하면 부가세(10%)를 자동으로 계산해드립니다.',
    url: 'https://doguham.kr/vat',
  },
}

export default function VatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 2: app/vat/page.tsx 작성**

```tsx
// app/vat/page.tsx
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
```

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/sunwookim/addr-converter && npm run build 2>&1 | tail -15
```

Expected: 빌드 성공, `/vat` 페이지 정적 생성 확인

- [ ] **Step 4: 커밋**

```bash
cd /Users/sunwookim/addr-converter && git add app/vat/layout.tsx app/vat/page.tsx && git commit -m "feat: /vat 페이지 추가 (서버 컴포넌트 wrapper + SEO 메타데이터)"
```

---

## Task 7: /vat/guide 가이드 페이지

**Files:**
- Create: `app/vat/guide/page.tsx`

- [ ] **Step 1: app/vat/guide/page.tsx 작성**

```tsx
// app/vat/guide/page.tsx
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
```

- [ ] **Step 2: 빌드 확인**

```bash
cd /Users/sunwookim/addr-converter && npm run build 2>&1 | tail -15
```

Expected: 빌드 성공

- [ ] **Step 3: 커밋**

```bash
cd /Users/sunwookim/addr-converter && git add app/vat/guide/page.tsx && git commit -m "feat: /vat/guide 사용 가이드 페이지 추가"
```

---

## Task 8: /vat/faq 페이지 (FAQPage JSON-LD)

**Files:**
- Create: `app/vat/faq/page.tsx`

- [ ] **Step 1: app/vat/faq/page.tsx 작성**

```tsx
// app/vat/faq/page.tsx
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
```

- [ ] **Step 2: 빌드 확인**

```bash
cd /Users/sunwookim/addr-converter && npm run build 2>&1 | tail -15
```

Expected: 빌드 성공

- [ ] **Step 3: 커밋**

```bash
cd /Users/sunwookim/addr-converter && git add app/vat/faq/page.tsx && git commit -m "feat: /vat/faq FAQ 페이지 추가 (FAQPage JSON-LD 포함)"
```

---

## Task 9: Sitemap 업데이트 + 전체 테스트 + 배포

**Files:**
- Modify: `app/sitemap.ts`

- [ ] **Step 1: sitemap.ts에 /vat 경로 추가**

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
    {
      url: 'https://doguham.kr/vat',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://doguham.kr/vat/guide',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://doguham.kr/vat/faq',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
```

- [ ] **Step 2: 전체 테스트 실행**

```bash
cd /Users/sunwookim/addr-converter && npm test -- --watchAll=false 2>&1 | tail -20
```

Expected: 모든 테스트 통과

- [ ] **Step 3: 최종 빌드 확인**

```bash
cd /Users/sunwookim/addr-converter && npm run build 2>&1 | tail -20
```

Expected: 빌드 성공. `/vat`, `/vat/guide`, `/vat/faq` 정적 페이지 생성 확인.

- [ ] **Step 4: 커밋 + 배포**

```bash
cd /Users/sunwookim/addr-converter && git add app/sitemap.ts && git commit -m "feat: sitemap에 /vat, /vat/guide, /vat/faq 추가" && git push origin main
```

Vercel 자동 배포 시작 (GitHub main 브랜치 연동). 배포 완료 후 아래 URL 확인:
- https://doguham.kr/vat
- https://doguham.kr/vat/guide
- https://doguham.kr/vat/faq

- [ ] **Step 5: Google Search Console 색인 요청**

Google Search Console → URL 검사 → 각 URL 입력 → "색인 생성 요청":
- `https://doguham.kr/vat`
- `https://doguham.kr/vat/guide`
- `https://doguham.kr/vat/faq`
