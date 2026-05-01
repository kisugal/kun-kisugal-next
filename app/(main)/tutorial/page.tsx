'use client'

import { Image } from '@heroui/react'
import Link from 'next/link'

const emulators = [
  {
    title: '模拟器',
    lilst: [
      {
        name: 'KiriKiri',
        icon: 'Kkirikiri.webp',
        href: 'https://c.acgll.com/@s/msdn9ItU'
      },
      {
        name: 'ONS',
        icon: 'ONScripter.webp',
        href: 'https://c.acgll.com/@s/yxH4WjLN'
      },
      {
        name: 'Tyrano',
        icon: 'tyranor.webp',
        href: 'https://c.acgll.com/@s/jtbxxdXB'
      },
      { name: 'PSP', icon: 'PSP.png', href: 'https://c.acgll.com/@s/Fj0F80IE' },
      { name: 'NDS', icon: 'NDS.png', href: 'https://c.acgll.com/@s/xnVz8zUn' },
      {
        name: 'JoiPlay',
        icon: 'JoiPlay.webp',
        href: 'https://c.acgll.com/@s/ABD4a0QQ'
      }
    ]
  },
  {
    title: '手机解压缩软件',
    lilst: [
      {
        name: 'RAR',
        icon: '/RAR.png',
        href: 'https://c.acgll.com/@s/XXP0Haq3'
      },
      {
        name: 'ZArchiver Pro',
        icon: '/ZArchiver Pro.png',
        href: 'https://c.acgll.com/@s/OnbroFGc'
      }
    ]
  },
  {
    title: '电脑解压缩软件',
    lilst: [
      {
        name: 'RAR',
        icon: '/RAR.png',
        href: 'https://c.acgll.com/@s/rt0AhhTS'
      },
      {
        name: 'Bandizip',
        icon: '/Bandizip.png',
        href: 'https://c.acgll.com/@s/DcoG5DUC'
      },
      { name: '7-Zip', icon: '/7-Zip.png', href: 'https://www.7-zip.org/' },
      {
        name: 'NanaZip',
        icon: '/NanaZip.png',
        href: 'https://apps.microsoft.com/detail/9n8g7tscl18r'
      }
    ]
  }
]

// const tutorials = [
//   { title: '如何安装模拟器', desc: '入门 · 5分钟', href: '#' },
//   { title: '游戏导入教程', desc: '新手必看', href: '#' },
//   { title: '报错解决', desc: '常见问题', href: '#' },
//   { title: '补丁安装指南', desc: '进阶教程', href: '#' }
// ]

export default function TutorialPage() {
  return (
    <div className="w-full flex justify-center">
      {/* 居中容器 */}
      <div className="w-full max-w-5xl">
        {/* 标题 */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold">教程 & 模拟器</h1>
          <p className="text-gray-500 text-sm mt-1">
            为你提供实用的游戏工具与详细教程
          </p>
        </div>

        {/* ===== 模拟器 ===== */}
        <div className="space-y-6">
          {emulators.map((emuGroup) => (
            <div key={emuGroup.title}>
              <h2 className="text-lg font-semibold mb-6">{emuGroup.title}</h2>

              <div className="flex gap-10 flex-wrap">
                {emuGroup.lilst.map((emu) => {
                  const Icon = emu.icon

                  return (
                    <Link key={emu.name} href={emu.href} target="_blank">
                      <div className="flex flex-col items-center gap-3 group cursor-pointer">
                        {/* 图标（放大版） */}
                        <div
                          className="
                      w-20 h-20 rounded-2xl
                      bg-white border border-gray-200
                      shadow-sm
                      flex items-center justify-center
                      transition-all
                      group-hover:shadow-md
                      group-hover:-translate-y-1
                    "
                        >
                          <Image
                            src={Icon}
                            alt={emu.name}
                            className="w-8 h-8 text-pink-400"
                          />
                        </div>

                        {/* 名字 */}
                        <span className="text-sm text-gray-600 group-hover:text-pink-500 transition">
                          {emu.name}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ===== 分隔线 ===== */}
        <div className="my-10 border-t border-gray-200" />

        {/* ===== 教程 ===== */}
        <div>
          <h2 className="text-lg font-semibold mb-6">教程</h2>
          <div>施工……</div>

          {/*<div className="grid grid-cols-2 gap-5">
            {tutorials.map((item) => (
              <Link key={item.title} href={item.href}>
                <div
                  className="
                  p-4 rounded-xl border border-gray-200
                  bg-white
                  hover:shadow-md transition
                  cursor-pointer
                "
                >
                  <div className="font-medium mb-1">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>*/}
        </div>
      </div>
    </div>
  )
}
