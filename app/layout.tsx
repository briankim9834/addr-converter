// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://doguham.kr'),
  title: {
    default: '도구함 — 직장인을 위한 실용 도구',
    template: '%s | 도구함',
  },
  description:
    '영문주소 변환 등 업무와 일상에서 바로 쓸 수 있는 유틸 도구 모음. 해외배송·직구 영문주소 변환기.',
  keywords: ['도구함', '영문주소변환기', '주소영문변환', '해외배송주소', '직구영문주소'],
  openGraph: {
    siteName: '도구함',
    locale: 'ko_KR',
    type: 'website',
    url: 'https://doguham.kr',
  },
  twitter: {
    card: 'summary_large_image',
    title: '도구함 — 직장인을 위한 실용 도구',
    description: '영문주소 변환 등 업무와 일상에서 바로 쓸 수 있는 유틸 도구 모음.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
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
        <Footer />
        <Script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6JGWG2CRXG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6JGWG2CRXG');
          `}
        </Script>
        <Analytics />
      </body>
    </html>
  )
}
