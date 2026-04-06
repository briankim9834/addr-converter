// app/api/juso/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { JusoApiResponse } from '@/types/address'

const JUSO_API_URL = 'https://business.juso.go.kr/addrlink/addrEngApi.do'

export async function GET(req: NextRequest) {
  const apiKey = process.env.JUSO_API_KEY
  if (!apiKey) {
    console.error('JUSO_API_KEY is not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const keyword = req.nextUrl.searchParams.get('keyword')

  if (!keyword) {
    return NextResponse.json({ error: 'keyword is required' }, { status: 400 })
  }

  const params = new URLSearchParams({
    confmKey: apiKey,
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

  let data: JusoApiResponse
  try {
    data = await response.json() as JusoApiResponse
  } catch {
    return NextResponse.json({ error: 'JUSO API 응답 파싱 실패' }, { status: 500 })
  }

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
