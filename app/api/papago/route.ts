// app/api/papago/route.ts
import { NextRequest, NextResponse } from 'next/server'

const PAPAGO_URL = 'https://openapi.naver.com/v1/papago/n2mt'

export async function POST(req: NextRequest) {
  const clientId = process.env.PAPAGO_CLIENT_ID
  const clientSecret = process.env.PAPAGO_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('PAPAGO_CLIENT_ID or PAPAGO_CLIENT_SECRET is not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  let body: { text?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const text = body.text ?? ''
  if (!text.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  let response: Response
  try {
    response = await fetch(PAPAGO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
      body: new URLSearchParams({ source: 'ko', target: 'en', text }),
    })
  } catch {
    return NextResponse.json({ error: 'Papago API 연결 실패' }, { status: 500 })
  }

  if (!response.ok) {
    return NextResponse.json({ error: 'Papago API 오류' }, { status: 500 })
  }

  let data: { message?: { result?: { translatedText?: string } } }
  try {
    data = await response.json()
  } catch {
    return NextResponse.json({ error: 'Papago API 응답 파싱 실패' }, { status: 500 })
  }

  const translatedText: string = data?.message?.result?.translatedText ?? ''
  return NextResponse.json({ translatedText })
}
