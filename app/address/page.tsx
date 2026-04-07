// app/address/page.tsx
import AddressPageClient from '@/components/address/AddressPageClient'
import ToolTabs from '@/components/ToolTabs'

const ADDRESS_TABS = [
  { label: '🗺️ 변환기', href: '/address' },
  { label: '📖 가이드', href: '/address/guide' },
  { label: '❓ FAQ', href: '/address/faq' },
]

export default function AddressPage() {
  return (
    <>
      <ToolTabs tabs={ADDRESS_TABS} currentPath="/address" />
      <AddressPageClient />
    </>
  )
}
