'use client'

import { Image } from '@heroui/image'

interface AdItem {
    id: string
    title: string
    description: string
    image: string
    link: string
}

// 独立配置的广告数据
const REDIRECT_ADS_DATA: AdItem[] = [
    {
        id: 'redirect-ad1', //风月AI
        title: '',
        description: '',
        image: '',
        link: ''
    },
    {
        id: 'redirect-ad2',
        title: ' ',
        description: ' ',
        image: ' ',
        link: ' '
    },
    {
        id: 'redirect-ad4', //muguawan
        title: '',
        description: '',
        image: '',
        link: ''
    }
]

export const RedirectAds = () => {
    return (
        <div className="max-w-2xl">
            {REDIRECT_ADS_DATA.filter(ad => ad.image.trim() && ad.link.trim()).map((ad) => (
                <a
                    key={ad.id}
                    href={ad.link}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="block cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <Image
                        src={ad.image}
                        alt={ad.title}
                        className="w-full h-auto object-contain rounded-lg"
                        radius="lg"
                    />
                </a>
            ))}
        </div>
    )
}