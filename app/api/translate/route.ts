// app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { notifySlackError } from '@/lib/slack'

const DEEPL_URL = 'https://api-free.deepl.com/v2/translate'

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) {
    console.error('DEEPL_API_KEY is not configured')
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
    response = await fetch(DEEPL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        source_lang: 'KO',
        target_lang: 'EN-US',
      }),
    })
  } catch (e) {
    await notifySlackError('DeepL API 연결 실패', String(e))
    return NextResponse.json({ error: 'DeepL API 연결 실패' }, { status: 500 })
  }

  if (!response.ok) {
    await notifySlackError(`DeepL API HTTP 오류 — status: ${response.status}`)
    return NextResponse.json({ error: 'DeepL API 오류' }, { status: 500 })
  }

  let data: { translations?: { text: string }[] }
  try {
    data = await response.json()
  } catch (e) {
    await notifySlackError('DeepL API 응답 파싱 실패', String(e))
    return NextResponse.json({ error: 'DeepL API 응답 파싱 실패' }, { status: 500 })
  }

  const translatedText = data?.translations?.[0]?.text ?? ''
  return NextResponse.json({ translatedText })
}
