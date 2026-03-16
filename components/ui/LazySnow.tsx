'use client'

import dynamic from 'next/dynamic'

const Snow = dynamic(() => import('~/components/ui/Snow'), {
  ssr: false
})

export const LazySnow = ({ enabled }: { enabled?: boolean }) => {
  return <Snow enabled={enabled} />
}
