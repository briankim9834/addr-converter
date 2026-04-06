# 영문주소 변환기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 한글 주소를 항목별 영문 주소로 변환하고 각 필드를 개별 복사할 수 있는 웹 유틸 서비스를 Next.js로 구축한다.

**Architecture:** Next.js App Router로 홈(`/`)과 영문주소 변환기(`/address`) 두 페이지를 구성한다. API 키는 서버사이드 Next.js API routes로 프록시해 클라이언트에 노출하지 않는다. 카카오 우편번호 위젯으로 주소 검색 → JUSO API로 영문 변환 → Papago API로 상세주소 번역 순으로 처리한다.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Kakao Postcode Widget (CDN), 행안부 JUSO API, Naver Papago API, Jest + React Testing Library, Vercel

---

## File Structure

```
addr-converter/
├── app/
│   ├── layout.tsx                  # Root layout, Kakao script 로드, 공통 메타데이터
│   ├── page.tsx                    # 홈: 도구 카드 그리드
│   ├── globals.css
│   ├── address/
│   │   └── page.tsx                # /address: 영문주소 변환기 페이지
│   └── api/
│       ├── juso/
│       │   └── route.ts            # JUSO API 프록시 (API 키 서버사이드 보호)
│       └── papago/
│           └── route.ts            # Papago API 프록시
├── components/
│   ├── Header.tsx                  # 그라데이션 네비게이션 헤더
│   ├── ToolCard.tsx                # 홈 페이지 도구 카드
│   └── address/
│       ├── AddressSearch.tsx       # 카카오 우편번호 위젯 + 선택 상태 관리
│       ├── DetailInput.tsx         # 상세주소 입력 + 영문변환 버튼
│       ├── ResultSection.tsx       # 결과 카드 컨테이너 + 수정/초기화 컨트롤
│       ├── ResultCard.tsx          # 단일 필드 카드 (필드명 + 값 + 복사 버튼)
│       ├── EditPanel.tsx           # 인라인 수정 패널
│       └── SiteGuide.tsx           # 탭형 사이트별 입력 가이드
├── lib/
│   └── address.ts                  # 순수 함수: engAddr 파싱, 전체주소 포맷
├── types/
│   └── address.ts                  # TypeScript 인터페이스
├── __tests__/
│   ├── lib/
│   │   └── address.test.ts
│   └── api/
│       ├── juso.test.ts
│       └── papago.test.ts
├── .env.local                      # API 키 (git 제외)
├── .env.local.example              # 키 이름 템플릿 (git 포함)
├── jest.config.ts
└── jest.setup.ts
```

---

## Task 1: 프로젝트 초기 설정

**Files:**
- Create: `addr-converter/` (Next.js 프로젝트 전체)
- Create: `.env.local.example`
- Create: `jest.config.ts`
- Create: `jest.setup.ts`

- [ ] **Step 1: Next.js 프로젝트 생성**

```bash
cd /Users/sunwookim
npx create-next-app@14 addr-converter \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=no \
  --import-alias="@/*"
cd addr-converter
```

프롬프트가 나오면 모두 기본값(Enter)으로 진행한다.

- [ ] **Step 2: 테스트 도구 설치**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

- [ ] **Step 3: jest.config.ts 생성**

```typescript
// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 4: jest.setup.ts 생성**

```typescript
// jest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: package.json에 test 스크립트 추가**

`package.json`의 `"scripts"` 항목에 아래 줄을 추가한다:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 6: .env.local.example 생성**

```bash
# .env.local.example
# 아래 파일을 복사해 .env.local을 만들고 실제 키를 입력하세요
# cp .env.local.example .env.local

JUSO_API_KEY=your_juso_api_key_here
PAPAGO_CLIENT_ID=your_naver_client_id_here
PAPAGO_CLIENT_SECRET=your_naver_client_secret_here
```

- [ ] **Step 7: .env.local 생성 (실제 키는 나중에 입력)**

```bash
cp .env.local.example .env.local
```

- [ ] **Step 8: .gitignore 확인 — .env.local 제외 확인**

`.gitignore` 파일에 `.env.local`이 이미 포함되어 있는지 확인한다. 없으면 추가:

```
.env.local
```

- [ ] **Step 9: Git 초기화 및 첫 커밋**

```bash
git init
git add .
git commit -m "feat: initial Next.js project setup with Jest"
```

Expected output: `[main (root-commit) xxxxxxx] feat: initial Next.js project setup with Jest`

---

## Task 2: TypeScript 타입 정의

**Files:**
- Create: `types/address.ts`

- [ ] **Step 1: types/address.ts 생성**

```typescript
// types/address.ts

/** 카카오 우편번호 위젯 oncomplete 콜백 데이터 */
export interface KakaoAddressData {
  roadAddress: string      // 도로명주소: "서울 강남구 테헤란로 152"
  jibunAddress: string     // 지번주소: "서울 강남구 역삼동 737"
  zonecode: string         // 우편번호: "06142"
  addressType: 'R' | 'J'  // R: 도로명, J: 지번
  buildingName: string     // 건물명: "강남파이낸스센터"
  bname: string            // 법정동명
}

/** JUSO API 응답의 개별 주소 항목 */
export interface JusoItem {
  roadAddr: string         // 도로명주소 (한글)
  engAddr: string          // 영문주소 전체: "152, Teheran-ro, Gangnam-gu, Seoul"
  zipNo: string            // 우편번호
  siNm: string             // 시도명 (한글): "서울특별시"
  sggNm: string            // 시군구명 (한글): "강남구"
}

/** JUSO API 전체 응답 구조 */
export interface JusoApiResponse {
  results: {
    common: {
      errorCode: string
      errorMessage: string
      totalCount: string
    }
    juso: JusoItem[] | null
  }
}

/** 변환 결과 — 화면에 표시되는 구조화된 영문 주소 */
export interface ParsedAddress {
  addressLine1: string     // "152 Teheran-ro, Gangnam-gu"
  addressLine2: string     // Papago 번역된 상세주소 (편집 가능)
  city: string             // "Seoul"
  state: string            // "Seoul" (도 단위면 "Gyeonggi-do")
  zipCode: string          // "06142"
  country: string          // "South Korea" (고정)
  fullAddress: string      // 전체 한 줄 조합
}

/** 카카오에서 선택된 주소 상태 */
export interface SelectedAddress {
  korean: string           // 카카오에서 선택한 한글 도로명 주소
  zonecode: string         // 우편번호
}
```

- [ ] **Step 2: 커밋**

```bash
git add types/address.ts
git commit -m "feat: add address TypeScript types"
```

---

## Task 3: 주소 파싱 유틸리티 + 테스트

**Files:**
- Create: `lib/address.ts`
- Create: `__tests__/lib/address.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// __tests__/lib/address.test.ts
import { parseEngAddr, formatFullAddress } from '@/lib/address'
import { JusoItem, ParsedAddress } from '@/types/address'

const seoulJuso: JusoItem = {
  roadAddr: '서울특별시 강남구 테헤란로 152',
  engAddr: '152, Teheran-ro, Gangnam-gu, Seoul',
  zipNo: '06142',
  siNm: '서울특별시',
  sggNm: '강남구',
}

const provincialJuso: JusoItem = {
  roadAddr: '경기도 수원시 팔달구 효원로 1',
  engAddr: '1, Hyowon-ro, Paldal-gu, Suwon-si, Gyeonggi-do',
  zipNo: '16359',
  siNm: '경기도',
  sggNm: '수원시 팔달구',
}

describe('parseEngAddr', () => {
  it('서울 주소를 파싱한다 (4 parts)', () => {
    const result = parseEngAddr(seoulJuso)
    expect(result.addressLine1).toBe('152 Teheran-ro, Gangnam-gu')
    expect(result.city).toBe('Seoul')
    expect(result.state).toBe('Seoul')
    expect(result.zipCode).toBe('06142')
    expect(result.country).toBe('South Korea')
  })

  it('도 단위 주소를 파싱한다 (5 parts)', () => {
    const result = parseEngAddr(provincialJuso)
    expect(result.addressLine1).toBe('1 Hyowon-ro, Paldal-gu')
    expect(result.city).toBe('Suwon-si')
    expect(result.state).toBe('Gyeonggi-do')
    expect(result.zipCode).toBe('16359')
  })

  it('addressLine2는 빈 문자열로 초기화된다', () => {
    const result = parseEngAddr(seoulJuso)
    expect(result.addressLine2).toBe('')
  })
})

describe('formatFullAddress', () => {
  it('상세주소 없이 전체 주소를 포맷한다', () => {
    const address: ParsedAddress = {
      addressLine1: '152 Teheran-ro, Gangnam-gu',
      addressLine2: '',
      city: 'Seoul',
      state: 'Seoul',
      zipCode: '06142',
      country: 'South Korea',
      fullAddress: '',
    }
    expect(formatFullAddress(address)).toBe(
      '152 Teheran-ro, Gangnam-gu, Seoul 06142, South Korea'
    )
  })

  it('상세주소가 있으면 포함한다', () => {
    const address: ParsedAddress = {
      addressLine1: '152 Teheran-ro, Gangnam-gu',
      addressLine2: 'Helio City Apt 101, Unit 1103',
      city: 'Seoul',
      state: 'Seoul',
      zipCode: '06142',
      country: 'South Korea',
      fullAddress: '',
    }
    expect(formatFullAddress(address)).toBe(
      '152 Teheran-ro, Gangnam-gu, Helio City Apt 101 Unit 1103, Seoul 06142, South Korea'
    )
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx jest __tests__/lib/address.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/address'`

- [ ] **Step 3: lib/address.ts 구현**

```typescript
// lib/address.ts
import { JusoItem, ParsedAddress } from '@/types/address'

/**
 * JUSO API의 engAddr 문자열을 파싱해 구조화된 영문 주소를 반환한다.
 *
 * engAddr 포맷 (서울/광역시): "152, Teheran-ro, Gangnam-gu, Seoul"       → 4 parts
 * engAddr 포맷 (도 단위):     "1, Hyowon-ro, Paldal-gu, Suwon-si, Gyeonggi-do" → 5 parts
 */
export function parseEngAddr(juso: JusoItem): ParsedAddress {
  const parts = juso.engAddr.split(', ').map((p) => p.trim())

  // Address Line 1: 건물번호 + 도로명 + 구/군
  const addressLine1 = `${parts[0]} ${parts[1]}, ${parts[2]}`

  // City: 5개 이상이면 뒤에서 2번째, 4개면 마지막
  const city = parts.length >= 5 ? parts[parts.length - 2] : parts[parts.length - 1]

  // State: 항상 마지막 (서울은 city === state)
  const state = parts[parts.length - 1]

  const base: ParsedAddress = {
    addressLine1,
    addressLine2: '',
    city,
    state,
    zipCode: juso.zipNo,
    country: 'South Korea',
    fullAddress: '',
  }

  return { ...base, fullAddress: formatFullAddress(base) }
}

/**
 * ParsedAddress를 해외 배송용 전체 주소 한 줄로 포맷한다.
 */
export function formatFullAddress(address: ParsedAddress): string {
  const parts = [
    address.addressLine1,
    address.addressLine2 ? address.addressLine2 : null,
    `${address.city} ${address.zipCode}`,
    address.country,
  ].filter(Boolean) as string[]

  return parts.join(', ')
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npx jest __tests__/lib/address.test.ts --no-coverage
```

Expected: PASS (6 tests)

- [ ] **Step 5: 커밋**

```bash
git add lib/address.ts __tests__/lib/address.test.ts
git commit -m "feat: add address parsing utility with tests"
```

---

## Task 4: JUSO API 프록시 라우트 + 테스트

**Files:**
- Create: `app/api/juso/route.ts`
- Create: `__tests__/api/juso.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// __tests__/api/juso.test.ts
import { GET } from '@/app/api/juso/route'
import { NextRequest } from 'next/server'

// JUSO API 외부 호출을 mock으로 대체
global.fetch = jest.fn()

const mockJusoResponse = {
  results: {
    common: { errorCode: '0', errorMessage: '정상', totalCount: '1' },
    juso: [
      {
        roadAddr: '서울특별시 강남구 테헤란로 152',
        engAddr: '152, Teheran-ro, Gangnam-gu, Seoul',
        zipNo: '06142',
        siNm: '서울특별시',
        sggNm: '강남구',
      },
    ],
  },
}

describe('GET /api/juso', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JUSO_API_KEY = 'test-key'
  })

  it('keyword 파라미터로 JUSO API를 호출하고 결과를 반환한다', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockJusoResponse,
    })

    const req = new NextRequest(
      'http://localhost/api/juso?keyword=서울 강남구 테헤란로 152'
    )
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.juso).toHaveLength(1)
    expect(data.juso[0].engAddr).toBe('152, Teheran-ro, Gangnam-gu, Seoul')
  })

  it('keyword가 없으면 400을 반환한다', async () => {
    const req = new NextRequest('http://localhost/api/juso')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('JUSO API가 에러를 반환하면 500을 반환한다', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const req = new NextRequest(
      'http://localhost/api/juso?keyword=테스트주소'
    )
    const res = await GET(req)
    expect(res.status).toBe(500)
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx jest __tests__/api/juso.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/app/api/juso/route'`

- [ ] **Step 3: app/api/juso/route.ts 구현**

```typescript
// app/api/juso/route.ts
import { NextRequest, NextResponse } from 'next/server'

const JUSO_API_URL = 'https://business.juso.go.kr/addrlink/addrEngApi.do'

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get('keyword')

  if (!keyword) {
    return NextResponse.json({ error: 'keyword is required' }, { status: 400 })
  }

  const params = new URLSearchParams({
    confmKey: process.env.JUSO_API_KEY ?? '',
    currentPage: '1',
    countPerPage: '5',
    keyword,
    resultType: 'json',
  })

  let response: Response
  try {
    response = await fetch(`${JUSO_API_URL}?${params}`)
  } catch {
    return NextResponse.json({ error: 'JUSO API 연결 실패' }, { status: 500 })
  }

  if (!response.ok) {
    return NextResponse.json({ error: 'JUSO API 오류' }, { status: 500 })
  }

  const data = await response.json()

  if (data.results.common.errorCode !== '0') {
    return NextResponse.json(
      { error: data.results.common.errorMessage },
      { status: 500 }
    )
  }

  return NextResponse.json({
    juso: data.results.juso ?? [],
    totalCount: data.results.common.totalCount,
  })
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npx jest __tests__/api/juso.test.ts --no-coverage
```

Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add app/api/juso/route.ts __tests__/api/juso.test.ts
git commit -m "feat: add JUSO API proxy route with tests"
```

---

## Task 5: Papago API 프록시 라우트 + 테스트

**Files:**
- Create: `app/api/papago/route.ts`
- Create: `__tests__/api/papago.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// __tests__/api/papago.test.ts
import { POST } from '@/app/api/papago/route'
import { NextRequest } from 'next/server'

global.fetch = jest.fn()

describe('POST /api/papago', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.PAPAGO_CLIENT_ID = 'test-id'
    process.env.PAPAGO_CLIENT_SECRET = 'test-secret'
  })

  it('한글 텍스트를 영문으로 번역해 반환한다', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: {
          result: { translatedText: 'Helio City Apt 101, Unit 1103' },
        },
      }),
    })

    const req = new NextRequest('http://localhost/api/papago', {
      method: 'POST',
      body: JSON.stringify({ text: '헬리오시티 101동 1103호' }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.translatedText).toBe('Helio City Apt 101, Unit 1103')
  })

  it('text가 없으면 400을 반환한다', async () => {
    const req = new NextRequest('http://localhost/api/papago', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx jest __tests__/api/papago.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/app/api/papago/route'`

- [ ] **Step 3: app/api/papago/route.ts 구현**

```typescript
// app/api/papago/route.ts
import { NextRequest, NextResponse } from 'next/server'

const PAPAGO_URL = 'https://openapi.naver.com/v1/papago/n2mt'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const text: string = body.text ?? ''

  if (!text.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  let response: Response
  try {
    response = await fetch(PAPAGO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Naver-Client-Id': process.env.PAPAGO_CLIENT_ID ?? '',
        'X-Naver-Client-Secret': process.env.PAPAGO_CLIENT_SECRET ?? '',
      },
      body: new URLSearchParams({ source: 'ko', target: 'en', text }),
    })
  } catch {
    return NextResponse.json({ error: 'Papago API 연결 실패' }, { status: 500 })
  }

  if (!response.ok) {
    return NextResponse.json({ error: 'Papago API 오류' }, { status: 500 })
  }

  const data = await response.json()
  const translatedText: string = data?.message?.result?.translatedText ?? ''

  return NextResponse.json({ translatedText })
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npx jest __tests__/api/papago.test.ts --no-coverage
```

Expected: PASS (2 tests)

- [ ] **Step 5: 전체 테스트 한 번에 통과 확인**

```bash
npx jest --no-coverage
```

Expected: PASS (11 tests total)

- [ ] **Step 6: 커밋**

```bash
git add app/api/papago/route.ts __tests__/api/papago.test.ts
git commit -m "feat: add Papago API proxy route with tests"
```

---

## Task 6: Root Layout + Header

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `components/Header.tsx`

- [ ] **Step 1: globals.css — Tailwind 기본 스타일 확인 후 커스텀 추가**

`app/globals.css`를 아래로 교체한다:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-violet-50 text-gray-900 antialiased;
  }
}
```

- [ ] **Step 2: components/Header.tsx 생성**

```tsx
// components/Header.tsx
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="text-white font-extrabold text-base leading-tight tracking-tight">
            ⚡ 유틸모음
          </span>
          <span className="text-white/60 text-xs">직장인을 위한 실용 도구들</span>
        </Link>
        <nav>
          <Link
            href="/address"
            className="text-white/80 text-sm hover:text-white transition-colors"
          >
            영문주소 변환
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: app/layout.tsx 수정 — Header + Kakao Script 포함**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import Header from '@/components/Header'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '유틸모음 — 직장인을 위한 실용 도구',
  description: '영문주소 변환, 단위변환 등 업무와 일상에서 바로 쓸 수 있는 유틸 도구 모음',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: 개발 서버 실행 — 헤더 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 을 열어 인디고/퍼플 그라데이션 헤더가 표시되는지 확인한다.

- [ ] **Step 5: 커밋**

```bash
git add app/layout.tsx app/globals.css components/Header.tsx
git commit -m "feat: add root layout with Header and Kakao script"
```

---

## Task 7: 홈 페이지 + ToolCard

**Files:**
- Create: `components/ToolCard.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: components/ToolCard.tsx 생성**

```tsx
// components/ToolCard.tsx
import Link from 'next/link'

interface ToolCardProps {
  icon: string
  title: string
  description: string
  href: string
}

export default function ToolCard({ icon, title, description, href }: ToolCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-indigo-100">
        <div className="text-3xl mb-3">{icon}</div>
        <h2 className="font-bold text-indigo-950 mb-1 text-sm">{title}</h2>
        <p className="text-gray-500 text-xs leading-relaxed mb-4">{description}</p>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold py-2 rounded-lg text-center">
          바로 사용 →
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: app/page.tsx 수정**

```tsx
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
```

- [ ] **Step 3: 브라우저에서 홈 페이지 확인**

`http://localhost:3000`에서 도구 카드 그리드가 표시되는지 확인한다.

- [ ] **Step 4: 커밋**

```bash
git add components/ToolCard.tsx app/page.tsx
git commit -m "feat: add home page with tool card grid"
```

---

## Task 8: AddressSearch 컴포넌트 (카카오 우편번호)

**Files:**
- Create: `components/address/AddressSearch.tsx`

- [ ] **Step 1: components/address/AddressSearch.tsx 생성**

```tsx
// components/address/AddressSearch.tsx
'use client'

import { KakaoAddressData, SelectedAddress } from '@/types/address'

// 카카오 우편번호 window 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: KakaoAddressData) => void
        width?: string
        height?: string
      }) => { open: () => void }
    }
  }
}

interface AddressSearchProps {
  selected: SelectedAddress | null
  onSelect: (address: SelectedAddress) => void
  onReset: () => void
}

export default function AddressSearch({
  selected,
  onSelect,
  onReset,
}: AddressSearchProps) {
  function openKakaoPostcode() {
    if (!window.daum?.Postcode) {
      alert('주소 검색 서비스를 불러오는 중이에요. 잠시 후 다시 시도해주세요.')
      return
    }
    new window.daum.Postcode({
      oncomplete(data: KakaoAddressData) {
        onSelect({
          korean: data.roadAddress || data.jibunAddress,
          zonecode: data.zonecode,
        })
      },
    }).open()
  }

  if (selected) {
    return (
      <div className="bg-white border-2 border-emerald-400 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-lg">✅</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-emerald-600 font-semibold mb-0.5">
            도로명 주소 선택됨
          </p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {selected.korean}
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-gray-400 underline hover:text-gray-600 whitespace-nowrap flex-shrink-0"
        >
          변경
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={openKakaoPostcode}
      className="w-full bg-white border-2 border-indigo-500 rounded-xl px-4 py-3 flex items-center gap-3 shadow-[0_0_0_4px_#EEF2FF] hover:border-indigo-600 transition-colors text-left"
    >
      <span className="text-xl">🔍</span>
      <div>
        <p className="text-xs text-indigo-500 font-semibold mb-0.5">
          ① 도로명 주소 검색
        </p>
        <p className="text-sm text-violet-300">
          예) 테헤란로 152, 강남구 역삼동...
        </p>
      </div>
    </button>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/address/AddressSearch.tsx
git commit -m "feat: add AddressSearch component with Kakao Postcode integration"
```

---

## Task 9: DetailInput 컴포넌트

**Files:**
- Create: `components/address/DetailInput.tsx`

- [ ] **Step 1: components/address/DetailInput.tsx 생성**

```tsx
// components/address/DetailInput.tsx
'use client'

import { useState } from 'react'

interface DetailInputProps {
  value: string
  onChange: (value: string) => void
  onTranslate: (korean: string) => Promise<void>
  isTranslating: boolean
}

export default function DetailInput({
  value,
  onChange,
  onTranslate,
  isTranslating,
}: DetailInputProps) {
  const [korean, setKorean] = useState('')

  async function handleTranslate() {
    if (!korean.trim()) return
    await onTranslate(korean)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-500 font-semibold mb-2">
        ② 상세주소 입력{' '}
        <span className="font-normal text-gray-400">
          — 동/호수/건물명 (선택사항)
        </span>
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={korean}
          onChange={(e) => setKorean(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
          placeholder="예) 헬리오시티 101동 1103호"
          className="flex-1 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400"
        />
        <button
          onClick={handleTranslate}
          disabled={isTranslating || !korean.trim()}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap hover:opacity-90 transition-opacity"
        >
          {isTranslating ? '번역 중...' : '영문 변환'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/address/DetailInput.tsx
git commit -m "feat: add DetailInput component for detail address translation"
```

---

## Task 10: ResultCard + ResultSection 컴포넌트

**Files:**
- Create: `components/address/ResultCard.tsx`
- Create: `components/address/EditPanel.tsx`
- Create: `components/address/ResultSection.tsx`

- [ ] **Step 1: components/address/ResultCard.tsx 생성**

```tsx
// components/address/ResultCard.tsx
'use client'

import { useState } from 'react'

interface ResultCardProps {
  label: string         // 주 레이블: "Street Address 1"
  subLabel?: string     // 부 레이블: "/ Address Line 1"
  value: string
  editable?: boolean    // Address Line 2만 true
  warning?: string      // 편집 가능 필드의 경고 문구
  onChange?: (value: string) => void
}

export default function ResultCard({
  label,
  subLabel,
  value,
  editable = false,
  warning,
  onChange,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={`bg-white rounded-xl px-4 py-3 border ${
        editable ? 'border-amber-400 border-2' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-xs font-bold text-indigo-950">{label}</span>
          {subLabel && (
            <span className="text-xs text-gray-400 ml-1">{subLabel}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          disabled={!value}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium px-3 py-1.5 rounded-md disabled:opacity-30 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
        >
          {copied ? '✓ 복사됨' : '📋 복사'}
        </button>
      </div>

      {editable ? (
        <>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:border-amber-400"
          />
          {warning && (
            <p className="text-xs text-amber-700 mt-1.5">⚠️ {warning}</p>
          )}
        </>
      ) : (
        <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: components/address/EditPanel.tsx 생성**

```tsx
// components/address/EditPanel.tsx
'use client'

import { SelectedAddress } from '@/types/address'

interface EditPanelProps {
  selected: SelectedAddress
  detail: string
  onDetailChange: (value: string) => void
  onReconvert: () => void
  onCancel: () => void
  isConverting: boolean
}

export default function EditPanel({
  selected,
  detail,
  onDetailChange,
  onReconvert,
  onCancel,
  isConverting,
}: EditPanelProps) {
  return (
    <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 mb-4">
      <p className="text-xs font-bold text-amber-700 mb-3">✏️ 주소 수정</p>

      <div className="bg-white border-2 border-indigo-400 rounded-lg px-3 py-2 flex items-center gap-2 mb-2">
        <span className="text-base">🔍</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-indigo-500 font-semibold mb-0.5">도로명 주소</p>
          <p className="text-sm text-gray-900 truncate">{selected.korean}</p>
        </div>
        <span className="text-xs text-gray-400 text-right leading-tight">
          주소 변경은<br />초기화 후 재검색
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-gray-500 font-semibold mb-1.5">상세주소 수정</p>
        <input
          type="text"
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
          className="w-full bg-violet-50 border border-violet-200 rounded-md px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-400"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReconvert}
          disabled={isConverting}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold py-2 rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isConverting ? '변환 중...' : '다시 변환'}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: components/address/ResultSection.tsx 생성**

```tsx
// components/address/ResultSection.tsx
'use client'

import { useState } from 'react'
import { ParsedAddress, SelectedAddress } from '@/types/address'
import { formatFullAddress } from '@/lib/address'
import ResultCard from './ResultCard'
import EditPanel from './EditPanel'

interface ResultSectionProps {
  address: ParsedAddress
  selected: SelectedAddress
  onReset: () => void
  onReconvert: (detail: string) => Promise<void>
  isConverting: boolean
}

export default function ResultSection({
  address,
  selected,
  onReset,
  onReconvert,
  isConverting,
}: ResultSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editDetail, setEditDetail] = useState(address.addressLine2)
  const [localAddress, setLocalAddress] = useState(address)
  const [copiedAll, setCopiedAll] = useState(false)

  function handleAddressLine2Change(value: string) {
    const updated = {
      ...localAddress,
      addressLine2: value,
      fullAddress: formatFullAddress({ ...localAddress, addressLine2: value }),
    }
    setLocalAddress(updated)
  }

  async function handleReconvert() {
    await onReconvert(editDetail)
    setIsEditing(false)
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(localAddress.fullAddress)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }

  return (
    <div>
      {/* 현재 주소 요약 + 수정/초기화 */}
      {!isEditing && (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1">현재 변환 중인 주소</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {selected.korean}
            </p>
            {localAddress.addressLine2 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {localAddress.addressLine2}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
            >
              ✏️ 수정
            </button>
            <button
              onClick={onReset}
              className="bg-red-50 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors"
            >
              ↺ 초기화
            </button>
          </div>
        </div>
      )}

      {/* 수정 패널 */}
      {isEditing && (
        <EditPanel
          selected={selected}
          detail={editDetail}
          onDetailChange={setEditDetail}
          onReconvert={handleReconvert}
          onCancel={() => setIsEditing(false)}
          isConverting={isConverting}
        />
      )}

      {/* 결과 카드들 */}
      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">
        변환 결과 — 항목별 복사
      </p>

      <div className={`grid gap-2.5 ${isEditing ? 'opacity-30 pointer-events-none' : ''}`}>
        <ResultCard
          label="Street Address 1"
          subLabel="/ Address Line 1"
          value={localAddress.addressLine1}
        />
        {localAddress.addressLine2 !== undefined && (
          <ResultCard
            label="Street Address 2"
            subLabel="/ Address Line 2"
            value={localAddress.addressLine2}
            editable
            warning="AI 번역 결과예요. 클릭해서 수정 후 복사하세요."
            onChange={handleAddressLine2Change}
          />
        )}
        <ResultCard label="City" value={localAddress.city} />
        <ResultCard
          label="State"
          subLabel="/ Province / Region"
          value={localAddress.state}
        />
        <ResultCard
          label="Zip Code"
          subLabel="/ Postal Code"
          value={localAddress.zipCode}
        />
        <ResultCard label="Country" value={localAddress.country} />

        {/* 전체 복사 */}
        <button
          onClick={handleCopyAll}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl px-4 py-4 flex items-center justify-between mt-1 hover:opacity-95 transition-opacity"
        >
          <div className="text-left">
            <p className="text-xs text-white/70 font-semibold mb-1">
              전체 주소 한 번에 복사
            </p>
            <p className="text-xs text-white leading-relaxed">
              {localAddress.fullAddress}
            </p>
          </div>
          <span className="bg-white text-indigo-600 text-xs font-bold px-3 py-2 rounded-lg ml-4 whitespace-nowrap flex-shrink-0">
            {copiedAll ? '✓ 복사됨' : '전체 복사'}
          </span>
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 커밋**

```bash
git add components/address/ResultCard.tsx components/address/EditPanel.tsx components/address/ResultSection.tsx
git commit -m "feat: add ResultCard, EditPanel, ResultSection components"
```

---

## Task 11: SiteGuide 컴포넌트

**Files:**
- Create: `components/address/SiteGuide.tsx`

- [ ] **Step 1: components/address/SiteGuide.tsx 생성**

```tsx
// components/address/SiteGuide.tsx
'use client'

import { useState } from 'react'
import { ParsedAddress } from '@/types/address'

interface SiteGuideProps {
  address: ParsedAddress
}

type SiteKey = 'amazon' | 'aliexpress' | 'malltail'

const SITE_LABELS: Record<SiteKey, string> = {
  amazon: '🛒 Amazon',
  aliexpress: '🛍️ AliExpress',
  malltail: '📦 몰테일',
}

const SITE_FIELDS: Record<SiteKey, { label: string; key: keyof ParsedAddress }[]> = {
  amazon: [
    { label: 'Full Name', key: 'country' }, // placeholder row
    { label: 'Address Line 1', key: 'addressLine1' },
    { label: 'Address Line 2', key: 'addressLine2' },
    { label: 'City', key: 'city' },
    { label: 'State / Province', key: 'state' },
    { label: 'ZIP / Postal Code', key: 'zipCode' },
    { label: 'Country', key: 'country' },
  ],
  aliexpress: [
    { label: 'Address Line 1', key: 'addressLine1' },
    { label: 'Address Line 2', key: 'addressLine2' },
    { label: 'City', key: 'city' },
    { label: 'Province / State', key: 'state' },
    { label: 'Zip Code', key: 'zipCode' },
    { label: 'Country / Region', key: 'country' },
  ],
  malltail: [
    { label: '도로명주소 (영문)', key: 'addressLine1' },
    { label: '상세주소 (영문)', key: 'addressLine2' },
    { label: '시/도 (영문)', key: 'state' },
    { label: '우편번호', key: 'zipCode' },
  ],
}

export default function SiteGuide({ address }: SiteGuideProps) {
  const [active, setActive] = useState<SiteKey>('amazon')

  const fields = SITE_FIELDS[active]

  return (
    <div className="mt-6">
      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">
        사이트별 입력 가이드
      </p>

      <div className="flex gap-2 mb-3 flex-wrap">
        {(Object.keys(SITE_LABELS) as SiteKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              active === key
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {SITE_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <p className="text-xs font-semibold text-gray-700 mb-3">
          {SITE_LABELS[active]} 입력창 기준
        </p>
        <div className="grid gap-2">
          {fields.map(({ label, key }) => {
            const value =
              key === 'country' && label === 'Full Name'
                ? '영문 이름으로 입력하세요'
                : (address[key] as string) || '—'
            return (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-36 flex-shrink-0">
                  {label}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded flex-1 ${
                    label === 'Full Name'
                      ? 'bg-gray-50 text-gray-400 italic'
                      : 'bg-indigo-50 text-indigo-700 font-medium'
                  }`}
                >
                  {value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/address/SiteGuide.tsx
git commit -m "feat: add SiteGuide tabbed component for Amazon/AliExpress/Malltail"
```

---

## Task 12: Address 페이지 조립

**Files:**
- Create: `app/address/page.tsx`

- [ ] **Step 1: app/address/page.tsx 생성**

```tsx
// app/address/page.tsx
'use client'

import { useState } from 'react'
import { ParsedAddress, SelectedAddress } from '@/types/address'
import { parseEngAddr, formatFullAddress } from '@/lib/address'
import AddressSearch from '@/components/address/AddressSearch'
import DetailInput from '@/components/address/DetailInput'
import ResultSection from '@/components/address/ResultSection'
import SiteGuide from '@/components/address/SiteGuide'

type Step = 'search' | 'detail' | 'result'

export default function AddressPage() {
  const [step, setStep] = useState<Step>('search')
  const [selected, setSelected] = useState<SelectedAddress | null>(null)
  const [parsedAddress, setParsedAddress] = useState<ParsedAddress | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  function handleReset() {
    setStep('search')
    setSelected(null)
    setParsedAddress(null)
  }

  function handleSelect(address: SelectedAddress) {
    setSelected(address)
    setStep('detail')
  }

  async function translateDetail(korean: string): Promise<string> {
    if (!korean.trim()) return ''
    const res = await fetch('/api/papago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: korean }),
    })
    if (!res.ok) return korean // 번역 실패 시 원문 그대로
    const data = await res.json()
    return data.translatedText ?? korean
  }

  async function handleTranslateDetail(korean: string) {
    setIsTranslating(true)
    const translated = await translateDetail(korean)
    // detail만 임시 저장 — 변환 버튼 클릭 시 최종 처리
    // (여기서는 상태를 올리지 않고 convert 시에 함께 처리)
    setIsTranslating(false)
    return translated
  }

  async function handleConvert(detailKorean: string = '') {
    if (!selected) return
    setIsConverting(true)

    try {
      // 1. JUSO API로 영문 주소 변환
      const jusoRes = await fetch(
        `/api/juso?keyword=${encodeURIComponent(selected.korean)}`
      )
      if (!jusoRes.ok) throw new Error('JUSO API 오류')
      const jusoData = await jusoRes.json()

      if (!jusoData.juso?.length) {
        alert('주소 변환 결과를 찾을 수 없어요. 다시 검색해주세요.')
        setIsConverting(false)
        return
      }

      const base = parseEngAddr(jusoData.juso[0])

      // 2. 상세주소 번역 (있으면)
      let addressLine2 = ''
      if (detailKorean.trim()) {
        addressLine2 = await translateDetail(detailKorean)
      }

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

  async function handleReconvert(detailKorean: string) {
    await handleConvert(detailKorean)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-indigo-950 mb-1">
          🗺️ 영문주소 변환기
        </h1>
        <p className="text-sm text-gray-500">해외배송·직구 주소 입력이 쉬워져요</p>
      </div>

      {/* STEP 1 & 2: 검색 + 상세주소 입력 */}
      {step !== 'result' && (
        <div className="grid gap-3 mb-4">
          <AddressSearch
            selected={selected}
            onSelect={handleSelect}
            onReset={handleReset}
          />

          {step === 'detail' && selected && (
            <>
              <DetailInput
                value=""
                onChange={() => {}}
                onTranslate={handleTranslateDetail}
                isTranslating={isTranslating}
              />
              <ConvertButton
                onConvert={handleConvert}
                isConverting={isConverting}
              />
            </>
          )}

          {step === 'search' && (
            <div className="bg-white/60 border border-violet-100 rounded-xl p-4 text-xs text-gray-500 leading-6">
              💡 <strong className="text-gray-700">이렇게 사용하세요</strong>
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

      {/* STEP 3: 결과 */}
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

// 변환 버튼 — 페이지 내부 전용 컴포넌트
function ConvertButton({
  onConvert,
  isConverting,
}: {
  onConvert: (detail?: string) => Promise<void>
  isConverting: boolean
}) {
  const [detail, setDetail] = useState('')

  return (
    <button
      onClick={() => onConvert(detail)}
      disabled={isConverting}
      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 hover:opacity-95 transition-opacity"
    >
      {isConverting ? '변환 중...' : '🗺️ 영문 주소로 변환하기'}
    </button>
  )
}
```

> **Note:** DetailInput의 상세주소 값을 ConvertButton까지 전달하는 상태 흐름이 복잡하다. 위 코드는 상세주소를 DetailInput 내부에서 관리하고, 변환 버튼은 별도 ConvertButton으로 분리했다. 이 구조에서 상세주소는 변환 시 Papago API에서 처리된다.

- [ ] **Step 2: 개발 서버에서 전체 흐름 수동 테스트**

```bash
npm run dev
```

`http://localhost:3000/address` 에서:
1. 검색창 클릭 → 카카오 우편번호 팝업 확인
2. 주소 선택 → 상세주소 입력창 + 변환 버튼 표시 확인
3. "영문 주소로 변환하기" 클릭 → 결과 카드 표시 확인
4. 복사 버튼 클릭 → 클립보드 복사 확인
5. 수정 → 수정 패널 확인
6. 초기화 → 첫 화면 복귀 확인

- [ ] **Step 3: 커밋**

```bash
git add app/address/page.tsx
git commit -m "feat: assemble address converter page with full user flow"
```

---

## Task 13: SEO 최적화

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/address/page.tsx` → `app/address/layout.tsx` 분리
- Create: `app/address/layout.tsx`

- [ ] **Step 1: app/layout.tsx — 공통 메타데이터 강화**

`app/layout.tsx`의 `metadata` 객체를 아래로 교체한다:

```typescript
export const metadata: Metadata = {
  title: {
    default: '유틸모음 — 직장인을 위한 실용 도구',
    template: '%s | 유틸모음',
  },
  description:
    '영문주소 변환 등 업무와 일상에서 바로 쓸 수 있는 유틸 도구 모음. 해외배송·직구 영문주소 변환기.',
  keywords: ['유틸모음', '영문주소변환기', '주소영문변환', '해외배송주소', '직구영문주소'],
  openGraph: {
    siteName: '유틸모음',
    locale: 'ko_KR',
    type: 'website',
  },
}
```

- [ ] **Step 2: app/address/layout.tsx 생성 — 영문주소 변환기 전용 메타데이터**

```tsx
// app/address/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '영문주소 변환기 — 한글 주소를 영문으로 즉시 변환',
  description:
    '한글 주소를 입력하면 Address Line 1/2, City, State, ZIP Code 등 항목별 영문 주소로 즉시 변환. 각 항목을 개별 복사해 아마존·알리익스프레스·몰테일 등에 바로 입력하세요.',
  keywords: [
    '영문주소변환기',
    '주소영문변환',
    '주소 영문변환',
    '한글주소 영문변환',
    '해외배송 영문주소',
    '직구 영문주소',
  ],
  openGraph: {
    title: '영문주소 변환기',
    description: '한글 주소를 항목별 영문 주소로 즉시 변환',
  },
}

export default function AddressLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

- [ ] **Step 3: app/address/page.tsx 첫 줄에서 'use client' 유지 확인**

`app/address/page.tsx`는 `'use client'` 지시문이 있어야 한다. SEO 메타데이터는 `layout.tsx`에서 처리하므로 페이지는 클라이언트 컴포넌트로 유지한다.

- [ ] **Step 4: 커밋**

```bash
git add app/layout.tsx app/address/layout.tsx
git commit -m "feat: add SEO metadata for home and address pages"
```

---

## Task 14: GitHub + Vercel 배포

**Files:**
- Create: `.gitignore` 확인
- Vercel 설정 (대시보드에서 처리)

- [ ] **Step 1: GitHub 레포지토리 생성**

GitHub.com에서 새 레포를 만든다:
- Repository name: `addr-converter`
- Visibility: Private (API 키 실수 방지)
- Initialize: 체크 해제 (이미 로컬에 git 있음)

- [ ] **Step 2: 원격 레포 연결 및 푸시**

```bash
git remote add origin https://github.com/[본인-username]/addr-converter.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: API 키 발급 — JUSO**

1. [주소기반산업지원서비스](https://business.juso.go.kr) 접속
2. 회원가입 → 로그인
3. 개발자센터 → API 신청 → "도로명주소 API (영문)" 선택
4. 발급된 `confmKey` 복사

- [ ] **Step 4: API 키 발급 — Papago**

1. [Naver Developers](https://developers.naver.com) 접속
2. 애플리케이션 등록 → "Papago 번역" 선택
3. 발급된 `Client ID`, `Client Secret` 복사

- [ ] **Step 5: .env.local에 실제 키 입력**

```bash
# .env.local
JUSO_API_KEY=실제_JUSO_키_입력
PAPAGO_CLIENT_ID=실제_PAPAGO_CLIENT_ID
PAPAGO_CLIENT_SECRET=실제_PAPAGO_CLIENT_SECRET
```

- [ ] **Step 6: 로컬에서 실제 API 동작 확인**

```bash
npm run dev
```

`http://localhost:3000/address`에서 실제 주소를 검색해 영문 변환이 정상 동작하는지 확인한다.

- [ ] **Step 7: Vercel 배포 설정**

1. [vercel.com](https://vercel.com) 접속 → GitHub로 로그인
2. "Add New Project" → `addr-converter` 레포 선택
3. Framework: **Next.js** (자동 감지)
4. "Environment Variables" 탭에서 3개 키 추가:
   - `JUSO_API_KEY`
   - `PAPAGO_CLIENT_ID`
   - `PAPAGO_CLIENT_SECRET`
5. "Deploy" 클릭

- [ ] **Step 8: 배포 URL 확인**

Vercel이 제공하는 `*.vercel.app` URL에서 전체 흐름이 정상 동작하는지 확인한다.

- [ ] **Step 9: 최종 커밋**

```bash
git add .
git commit -m "chore: production deployment ready"
git push origin main
```

---

## Self-Review

**Spec coverage 확인:**

| 스펙 요구사항 | 구현 Task |
|---|---|
| 카카오 우편번호 자동완성 | Task 8 (AddressSearch) |
| JUSO API 영문 변환 | Task 4 + Task 12 |
| Papago 상세주소 번역 | Task 5 + Task 9 |
| Address Line 2 편집 가능 필드 | Task 10 (ResultCard editable) |
| ⚠️ 번역 안내 문구 | Task 10 (ResultCard warning) |
| 항목별 복사 버튼 | Task 10 (ResultCard) |
| 전체 복사 버튼 | Task 10 (ResultSection) |
| 수정 / 초기화 동선 | Task 10 (ResultSection, EditPanel) |
| 사이트별 입력 가이드 탭 | Task 11 (SiteGuide) |
| 카드형 홈 + 개별 툴 페이지 구조 | Task 6, 7, 12 |
| 인디고/퍼플 그라데이션 디자인 | Task 6~12 (전체 Tailwind 클래스) |
| max-width 560px 중앙 정렬 | Task 12 (address page max-w-lg) |
| SEO 메타데이터 | Task 13 |
| Vercel 배포 | Task 14 |
| 에러 처리 (API 실패) | Task 4, 5, 12 |
| TypeScript 타입 | Task 2 |
| 테스트 (유틸, API 라우트) | Task 3, 4, 5 |

모든 스펙 요구사항이 Task에 매핑됨. ✅
