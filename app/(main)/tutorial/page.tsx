import Image from 'next/image'
import Link from 'next/link'

import Bandizip from '@/public/Bandizip.png'
import Kkirikiri from '@/public/Kkirikiri.webp'
import ONScripter from '@/public/ONScripter.webp'
import tyranor from '@/public/tyranor.webp'
import Psp from '@/public/PSP.png'
import Nds from '@/public/NDS.png'
import JoiPlay from '@/public/JoiPlay.webp'
import MiNE from '@/public/ONScripter-MiNE.jpg'
import Rar from '@/public/RAR.png'
import NanaZip from '@/public/NanaZip.png'
import ZArchiver from '@/public/ZArchiver Pro.png'
import SevenZip from '@/public/7-Zip.png'
import AopAop from '@/public/AopAop.webp'

import { getAllPosts } from '~/lib/mdx/getPosts'
import { Metadata } from 'next'
import { kunMetadata } from './metadata'

const featured = [
  {
    name: 'KRKR2模拟器',
    image: Kkirikiri,
    href: 'https://c.acgll.com/@s/msdn9ItU'
  },
  {
    name: 'ONScripter模拟器',
    image: ONScripter,
    href: 'https://c.acgll.com/@s/yxH4WjLN'
  },
  {
    name: 'Tyranor模拟器',
    image: tyranor,
    href: 'https://c.acgll.com/@s/jtbxxdXB'
  },
  {
    name: 'JoiPlay模拟器',
    image: JoiPlay,
    href: 'https://c.acgll.com/@s/ABD4a0QQ'
  }
]

const emulators = [
  {
    title: '模拟器',
    list: [
      {
        name: 'KRKR2模拟器',
        icon: Kkirikiri,
        href: 'https://c.acgll.com/@s/msdn9ItU'
      },
      {
        name: 'ONScripter模拟器',
        icon: ONScripter,
        href: 'https://c.acgll.com/@s/yxH4WjLN'
      },
      {
        name: 'Tyranor模拟器',
        icon: tyranor,
        href: 'https://c.acgll.com/@s/jtbxxdXB'
      },
      {
        name: 'PSP模拟器',
        icon: Psp,
        href: 'https://c.acgll.com/@s/Fj0F80IE'
      },
      {
        name: 'NDS模拟器',
        icon: Nds,
        href: 'https://c.acgll.com/@s/xnVz8zUn'
      },
      {
        name: 'JoiPlay模拟器',
        icon: JoiPlay,
        href: 'https://c.acgll.com/@s/ABD4a0QQ'
      },
      {
        name: 'MiNE模拟器',
        icon: MiNE,
        href: 'https://c.acgll.com/@s/exB2DorH'
      },
      {
        name: 'AopAop模拟器',
        icon: AopAop,
        href: 'https://c.acgll.com/@s/muocmwaT'
      }
    ]
  },

  {
    title: '手机解压缩软件',
    list: [
      {
        name: 'RAR',
        icon: Rar,
        href: 'https://c.acgll.com/@s/XXP0Haq3'
      },
      {
        name: 'ZArchiver Pro',
        icon: ZArchiver,
        href: 'https://c.acgll.com/@s/0mdJoGhd'
      }
    ]
  },

  {
    title: '电脑解压缩软件',
    list: [
      {
        name: 'RAR',
        icon: Rar,
        href: 'https://c.acgll.com/@s/rt0AhhTS'
      },
      {
        name: 'Bandizip',
        icon: Bandizip,
        href: 'https://c.acgll.com/@s/DcoG5DUC'
      },
      {
        name: '7-Zip',
        icon: SevenZip,
        href: 'https://www.7-zip.org/'
      },
      {
        name: 'NanaZip',
        icon: NanaZip,
        href: 'https://apps.microsoft.com/detail/9n8g7tscl18r'
      }
    ]
  }
]

export const metadata: Metadata = kunMetadata

export default function TutorialPage() {
  const posts = getAllPosts()

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      {/* 精选推荐 */}

      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-6">精选推荐</h2>

        <div className="flex gap-10 flex-wrap">
          {featured.map((item) => (
            <Link key={item.name} href={item.href} target="_blank">
              <div className="flex flex-col items-center gap-3 group">
                <div
                  className="
                  w-20 h-20 rounded-2xl
                  bg-white border
                  shadow-sm
                  flex items-center justify-center
                  overflow-hidden
                  transition
                  group-hover:-translate-y-1
                  "
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <span
                  className="
                text-sm text-gray-600
                group-hover:text-pink-500
                "
                >
                  {item.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h1 className="text-2xl font-bold">教程 & 模拟器</h1>

        <p className="text-gray-500 text-sm mt-1">
          为你提供实用的游戏工具与详细教程
        </p>
      </div>

      <div className="space-y-8">
        {emulators.map((group) => (
          <div key={group.title}>
            <h2 className="text-lg font-semibold mb-6">{group.title}</h2>

            <div className="flex gap-10 flex-wrap">
              {group.list.map((item) => {
                const Icon = item.icon

                return (
                  <Link key={item.name} href={item.href} target="_blank">
                    <div
                      className="
                        flex flex-col items-center gap-3
                        group
                        "
                    >
                      <div
                        className="
                          w-20 h-20 rounded-2xl
                          bg-white border
                          shadow-sm
                          flex items-center justify-center
                          "
                      >
                        <Image
                          src={Icon}
                          alt={item.name}
                          className="w-10 h-10 rounded"
                        />
                      </div>

                      <span
                        className="
                          text-sm text-gray-600
                          group-hover:text-pink-500
                          "
                      >
                        {item.name}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="my-10 border-t" />

      <div>
        <h2 className="text-lg font-semibold mb-6">教程</h2>

        <div className="grid grid-cols-2 gap-5">
          {posts.map((item) => (
            <Link key={item.title} href={`/tutorial/${item.path}`}>
              <div
                className="
                p-4 rounded-xl
                border
                bg-white
                hover:shadow-md
                "
              >
                <div className="font-medium mb-1">{item.title}</div>

                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
