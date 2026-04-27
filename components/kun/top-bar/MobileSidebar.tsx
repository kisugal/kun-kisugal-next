'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '~/utils/cn'
import { kunMoyuMoe } from '~/config/moyu-moe'
import {
  Gamepad2,
  FileText,
  Tags,
  Building,
  MessagesSquare,
  Home,
  Hash,
  X,
  HeartIcon,
  BookUser,
  Shield,
  Eye,
  HeartMinus
} from 'lucide-react'
import { Button } from '@heroui/button'
import { memo, useEffect, useState } from 'react'
import { useSettingStore } from '~/store/settingStore'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

// 完全复刻 PC 端的 navSections 内容与结构
const navSections = [
  {
    title: '推荐内容',
    items: [
      {
        name: 'Ai女友💋',
        description:
          '🌟在线畅玩。顶尖色情，即刻生图😍多样角色场景18禁性癖待你开发！💋',
        href: 'https://genrati.xyz?ref_id=006f5ccb-b0d3-471b-a674-de5e5114ed67',
        icon: HeartIcon
      },
      {
        name: '精品飞机杯',
        description: 'AYU-4396 没落女仆のメイド教育😍',
        href: 'https://s.tb.cn/c.0x1IWF',
        icon: HeartIcon
      },
      {
        name: '翻墙Vpn推荐',
        description:
          '翻墙Vpn推荐，加速下载！觉得下载资源慢？觉得加载页面不丝滑？',
        href: 'https://eueua.cc/#/register?code=V437MLYw',
        icon: HeartIcon
      }
    ]
  },
  {
    title: '核心功能',
    items: [
      { name: '首页', description: '网站首页', href: '/', icon: Home },
      {
        name: 'Galgame',
        description: 'Galgame 本体获取',
        href: '/galgame',
        icon: Gamepad2
      },
      {
        name: '模拟器及使用教程',
        description: 'Galgame 模拟器及使用教程',
        href: '/tutorial',
        icon: BookUser
      },
      {
        name: '补丁和存档',
        description: '游戏补丁与存档',
        href: '/resource',
        icon: FileText
      }
    ]
  },
  {
    title: '游戏信息',
    items: [
      {
        name: '游戏标签',
        description: '按标签浏览游戏',
        href: '/tag',
        icon: Tags
      },
      {
        name: '制作会社',
        description: '按会社浏览游戏',
        href: '/companies',
        icon: Building
      }
    ]
  },
  {
    title: '社区交流',
    items: [
      {
        name: '评论列表',
        description: '最新评论动态',
        href: '/comment',
        icon: MessagesSquare
      },
      { name: '话题列表', description: '最新话题', href: '/topic', icon: Hash }
    ]
  },
  {
    title: '其他',
    items: [
      {
        name: '友情链接',
        description: '可爱的好朋友们！',
        href: '/friend-link',
        icon: HeartMinus
      }
    ]
  }
]

const MobileSidebarComponent = ({ isOpen, onClose }: MobileSidebarProps) => {
  const pathname = usePathname()
  const settings = useSettingStore((state) => state.data)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isAnimate, setIsAnimate] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      const timer = requestAnimationFrame(() => setIsAnimate(true))
      document.body.style.overflow = 'hidden'
      return () => cancelAnimationFrame(timer)
    } else {
      setIsAnimate(false)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTransitionEnd = () => {
    if (!isOpen) setShouldRender(false)
  }

  // 完整还原 NSFW 提示逻辑与文字内容
  const NSFWNotice = () => {
    const isSFW = settings.kunNsfwEnable === 'sfw'
    const isNSFW = settings.kunNsfwEnable === 'nsfw'
    const isAll = settings.kunNsfwEnable === 'all'

    if (isSFW) {
      return (
        <div className="mx-2 mb-3 p-2 bg-primary/10 border border-primary/30 rounded-lg">
          <div className="flex items-start gap-1.5 text-[10px] leading-snug">
            <Shield className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">部分内容已隐藏</div>
              <div className="text-default-500">可在顶部切换显示模式</div>
            </div>
          </div>
        </div>
      )
    }

    if (isNSFW || isAll) {
      return (
        <div className="mx-2 mb-3 p-2 bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 rounded-lg">
          <div className="flex items-start gap-1.5 text-[10px] leading-snug text-pink-600 dark:text-pink-400">
            <Eye className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">已进入NSFW模式</div>
              <div>请勿在公共场所浏览</div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (!shouldRender) return null

  return (
    <>
      {/* 遮罩：修复点击穿透关键 */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isAnimate ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* 侧栏：宽度 210px，字体极致缩小 */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 w-[210px] bg-background z-50 flex flex-col',
          'transform transition-transform duration-300 ease-out shadow-2xl',
          isAnimate ? 'translate-x-0' : '-translate-x-full'
        )}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="flex items-center justify-between p-3 border-b border-divider">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <Image
              src="/favicon.webp"
              alt="Logo"
              width={24}
              height={24}
              className="rounded-lg"
            />
            <span className="font-bold text-[13px] text-primary leading-none">
              {kunMoyuMoe.creator.name}
            </span>
          </Link>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            radius="full"
            onPress={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
          <NSFWNotice />

          {navSections.map((section) => {
            const isAdSection = section.title === '推荐内容'

            return (
              <div
                key={section.title}
                className={cn(
                  'mb-3 px-1',
                  isAdSection &&
                    'mx-1.5 mb-4 p-2 bg-default-50 dark:bg-default-100/10 border border-primary dark:border-primary/50 rounded-xl shadow-sm backdrop-blur-sm'
                )}
              >
                <h2
                  className={cn(
                    'px-2.5 py-1 text-[10px] font-bold uppercase mb-0.5 transition-opacity',
                    isAdSection ? 'text-primary' : 'text-default-400'
                  )}
                >
                  {isAdSection ? '✨ ' + section.title : section.title}
                </h2>

                <ul className="space-y-0.5">
                  {section.items.map((item: any) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-start p-1.5 mx-1 rounded-lg transition-colors',
                          pathname === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'active:bg-default-100 text-foreground'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'w-4 h-4 mt-0.5 flex-shrink-0',
                            pathname === item.href
                              ? 'text-primary-foreground'
                              : isAdSection
                                ? 'text-primary'
                                : 'text-default-500'
                          )}
                        />

                        <div className="flex flex-col ms-2.5 min-w-0">
                          {/* 字体主标 13px，副标 10.5px */}
                          <span className="text-[13px] font-semibold leading-tight break-words">
                            {item.name}
                          </span>
                          <span
                            className={cn(
                              'text-[10.5px] mt-0.5 leading-snug break-words',
                              pathname === item.href
                                ? 'text-primary-foreground/80'
                                : 'text-default-500'
                            )}
                          >
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export const MobileSidebar = memo(MobileSidebarComponent)
