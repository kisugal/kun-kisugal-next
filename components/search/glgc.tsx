import { Image } from '@heroui/image'
import Link from 'next/link'

export const SearchGlgc = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto mt-6 space-y-4 opacity-80">
      <Link
        href="https://afengy.app/?ref_id=006f5ccb-b0d3-471b-a674-de5e5114ed67"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          alt=""
          src="https://r2.sakinori.top/%E9%A3%8E%E6%9C%88AI/1200x200-03.gif"
          className="w-auto h-auto max-w-full max-h-32 rounded-lg"
          style={{ objectFit: 'contain' }}
        />
      </Link>
    </div>
  )
}
