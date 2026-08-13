import { Image } from '@heroui/image'
import Link from 'next/link'

export const SearchGlgc = () => {
  return (
    <div className="w-full max-w-7xl mx-auto mt-6 px-4 opacity-80">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
        {/* 广告一 */}
        <Link
          href="https://afengy.app/?ref_id=006f5ccb-b0d3-471b-a674-de5e5114ed67"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex justify-center"
        >
          <Image
            alt="风月AI"
            src="https://r2.sakinori.top/%E9%A3%8E%E6%9C%88AI/1200x200-03.gif"
            className="w-full h-auto max-w-[600px] rounded-lg"
            style={{ objectFit: 'contain' }}
          />
        </Link>

        {/* 广告二 */}
        <Link
          href="https://l8.zwtcbp.com/dh1012"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex justify-center"
        >
          <Image
            alt="精选黄油🌟 福利游戏合集"
            src="https://d.acgll.com/%E5%9B%BE%E7%89%87%E5%AD%98%E5%82%A8/huangyou.jpg.png"
            className="w-full h-auto max-w-[600px] rounded-lg"
            style={{ objectFit: 'contain' }}
          />
        </Link>
      </div>
    </div>
  )
}
