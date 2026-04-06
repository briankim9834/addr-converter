// __tests__/api/juso.test.ts
// @jest-environment node
import { GET } from '@/app/api/juso/route'
import { NextRequest } from 'next/server'

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
