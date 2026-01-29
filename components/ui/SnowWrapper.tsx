'use client'

import dynamic from 'next/dynamic'

const Snow = dynamic(() => import('~/components/ui/Snow'), {
    ssr: false,
    loading: () => null
})

interface Props {
    enabled: boolean
}

export const SnowWrapper = ({ enabled }: Props) => {
    return <Snow enabled={enabled} />
}




