// @jest-environment node
import { POST } from '@/app/api/papago/route'
import { NextRequest } from 'next/server'

describe('POST /api/papago', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
    process.env.PAPAGO_CLIENT_ID = 'test-id'
    process.env.PAPAGO_CLIENT_SECRET = 'test-secret'
  })

  it('한글 텍스트를 영문으로 번역해 반환한다', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
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

  it('Papago API가 에러를 반환하면 500을 반환한다', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const req = new NextRequest('http://localhost/api/papago', {
      method: 'POST',
      body: JSON.stringify({ text: '헬리오시티 101동 1103호' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
