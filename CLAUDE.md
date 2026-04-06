# 도구함 (doguham.kr) — Claude Code 컨텍스트

## 서비스 개요
한글 주소를 영문 주소(Address Line 1/2, City, State, ZIP, Country)로 변환해주는 웹 서비스.
해외배송·직구 시 주소 입력을 쉽게 해주는 것이 목적.

## 기술 스택
- **Framework**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일**: Tailwind CSS
- **테스트**: Jest + React Testing Library
- **배포**: Vercel (GitHub 자동배포 — main 브랜치 push 시 자동 배포)
- **도메인**: doguham.kr (가비아 A 레코드 → Vercel)

## 환경 변수
`.env.local` 및 Vercel 프로덕션에 설정 필요:
- `JUSO_API_KEY` — 행안부 JUSO API 키 (영문 주소 변환)
- `DEEPL_API_KEY` — DeepL Free API 키 (상세주소 한→영 번역)

## 핵심 아키텍처

### 주소 변환 흐름
1. 카카오 우편번호 위젯 → 한글 도로명 주소 선택
2. `/api/juso` → 행안부 JUSO API로 영문 필드 조회
3. `/api/translate` → DeepL API로 상세주소 번역 (선택사항)
4. `lib/address.ts`의 `parseEngAddr()`로 구조화된 영문 주소 생성

### 주소 필드 매핑 (JUSO API → ParsedAddress)
- `addressLine1`: `${buldMnnm}-${buldSlno} ${rn}` (건물번호 + 도로명)
- `city`: `sggNm` (구/군 — 예: Yongsan-gu)
- `state`: `siNm` (시/도 — 예: Seoul, Gyeonggi-do)
- `zipCode`: `zipNo`
- `fullAddress` 순서: addressLine2 → addressLine1 → city zipCode → country

### API Routes
- `GET /api/juso?keyword=...` — JUSO 영문 주소 조회 프록시
- `POST /api/translate` — DeepL 번역 프록시 (body: `{ text: string }`)

## 디자인
- **테마**: 클린 블루 (밝은 배경 + blue-500/600 포인트)
- **배경**: `slate-50`
- **포인트**: `blue-500` (버튼), `blue-600` (전체복사 버튼)
- 디자인 변경 시 `design` 브랜치 생성 → 프리뷰 확인 후 main 머지

## 프로젝트 구조
```
app/
  page.tsx              # 홈 (도구 목록)
  address/
    page.tsx            # 주소 변환 메인 (3단계: search→detail→result)
    layout.tsx          # SEO 메타데이터 + JSON-LD
  api/
    juso/route.ts       # JUSO API 프록시
    translate/route.ts  # DeepL API 프록시
  layout.tsx            # 루트 레이아웃 (GA, Vercel Analytics)
  globals.css

components/
  Header.tsx
  Footer.tsx
  ToolCard.tsx
  address/
    AddressSearch.tsx   # 카카오 우편번호 위젯
    DetailInput.tsx     # 상세주소 입력
    ResultSection.tsx   # 변환 결과 + 전체복사
    ResultCard.tsx      # 항목별 복사 카드
    EditPanel.tsx       # 주소 수정 패널
    SiteGuide.tsx       # Amazon/AliExpress/몰테일 입력 가이드

lib/
  address.ts            # parseEngAddr(), formatFullAddress()

types/
  address.ts            # JusoItem, ParsedAddress, SelectedAddress 등
```

## SEO
- Google Search Console 등록 완료 (doguham.kr)
- sitemap: `doguham.kr/sitemap.xml`
- robots: `doguham.kr/robots.txt`
- OG 이미지: `app/address/opengraph-image.tsx`

## 분석
- Vercel Analytics — 페이지뷰, Core Web Vitals
- Google Analytics — GA4, 측정 ID: G-6JGWG2CRXG

## 향후 고도화 아이디어
- 다른 유틸 도구 추가 (멀티 유틸 플랫폼 확장)
- 주소 변환 히스토리 저장
- 복사 완료 후 어느 사이트에 입력했는지 트래킹
- 영→한 역변환 기능
