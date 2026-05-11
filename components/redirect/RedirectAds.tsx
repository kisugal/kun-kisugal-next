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
    id: 'redirect-ad1',
    title: 'AI涩涩❤️',
    description:
      '高自由度 AI 互动平台，支持图文模式、语音陪伴、AI 绘图与多题材角色互动。',
    image:
      'https://d.acgll.com/%E5%9B%BE%E7%89%87%E5%AD%98%E5%82%A8/photo_2026-05-03_23-53-08.jpg',
    link: 'https://www.ainexa.top?rf=e32c5b70'
  }
]

const validRedirectAds = REDIRECT_ADS_DATA.filter(
  (ad) => ad.id.trim() && ad.image.trim() && ad.link.trim()
)

export const RedirectAds = () => {
  return (
    <div className="max-w-2xl">
      {validRedirectAds.map((ad) => (
        <a
          key={ad.id}
          href={ad.link}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="block transition-opacity cursor-pointer hover:opacity-80"
        >
          <Image
            src={ad.image}
            alt={ad.title}
            className="w-full h-auto rounded-lg object-contain"
            radius="lg"
          />
        </a>
      ))}
    </div>
  )
}
