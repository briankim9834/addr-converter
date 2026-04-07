// app/rss.xml/route.ts
import { NextResponse } from 'next/server'

const BASE_URL = 'https://doguham.kr'

const pages = [
  {
    url: `${BASE_URL}/vat`,
    title: '부가세 계산기 — 공급가액·합계금액 자동 계산',
    description: '공급가액 또는 합계금액을 입력하면 부가세(10%)를 자동으로 계산해드립니다. 세금계산서 작성, 견적서 정리에 바로 활용하세요.',
    pubDate: new Date('2026-04-07').toUTCString(),
  },
  {
    url: `${BASE_URL}/vat/guide`,
    title: '부가세 계산기 사용 가이드 — 공급가액·합계금액 계산법',
    description: '부가세(VAT) 계산 방법을 단계별로 설명합니다. 공급가액과 합계금액의 차이, 세금계산서 작성 시 활용법까지 안내해드려요.',
    pubDate: new Date('2026-04-07').toUTCString(),
  },
  {
    url: `${BASE_URL}/vat/faq`,
    title: '부가세 계산기 자주 묻는 질문 (FAQ) — 도구함',
    description: '부가세율, 공급가액과 합계금액의 차이, 간이과세자 적용 여부 등 부가세 계산기에 관한 자주 묻는 질문에 답합니다.',
    pubDate: new Date('2026-04-07').toUTCString(),
  },
  {
    url: `${BASE_URL}/address`,
    title: '영문주소 변환기 — 한글 주소를 항목별 영문으로',
    description: '한글 주소를 해외배송·직구에 사용할 수 있는 영문 주소로 변환합니다. Address Line 1/2, City, ZIP Code 항목별로 바로 복사하세요.',
    pubDate: new Date('2026-01-05').toUTCString(),
  },
  {
    url: `${BASE_URL}/address/guide`,
    title: '영문주소 변환기 사용 가이드 — 해외배송·직구 영문주소 만들기',
    description: '아마존, 알리익스프레스, 몰테일 등 해외배송·직구 시 영문주소 입력 방법을 단계별로 설명합니다.',
    pubDate: new Date('2026-01-05').toUTCString(),
  },
  {
    url: `${BASE_URL}/address/faq`,
    title: '영문주소 변환 자주 묻는 질문 (FAQ) — 도구함',
    description: '영문주소 변환기 사용법, 아마존·알리익스프레스·몰테일 주소 입력 방법 등 자주 묻는 질문에 답합니다.',
    pubDate: new Date('2026-01-05').toUTCString(),
  },
]

export async function GET() {
  const items = pages
    .map(
      ({ url, title, description, pubDate }) => `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${url}</link>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${url}</guid>
    </item>`
    )
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>도구함 — 직장인을 위한 실용 도구들</title>
    <link>${BASE_URL}</link>
    <description>업무와 일상에서 바로 쓸 수 있는 무료 도구 모음</description>
    <language>ko</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
