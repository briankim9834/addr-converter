import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '영문주소 변환기 — 한글 주소를 영문으로 즉시 변환'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 24 }}>🗺️</div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: 'white',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          영문주소 변환기
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
          }}
        >
          한글 주소 → Address Line 1/2, City, State, ZIP
        </div>
        <div
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          해외배송 · 직구 주소 입력이 쉬워져요
        </div>
      </div>
    ),
    size,
  )
}
