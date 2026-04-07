import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#2563eb',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '36px',
          gap: 4,
        }}
      >
        <div style={{ fontSize: 80 }}>⚡</div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.5px',
          }}
        >
          도구함
        </div>
      </div>
    ),
    size,
  )
}
