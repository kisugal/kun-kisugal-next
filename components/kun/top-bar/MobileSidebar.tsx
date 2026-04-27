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
  Eye
} from 'lucide-react'
import { Button } from '@heroui/button'
import { memo, useEffect, useState } from 'react'
import { useSettingStore } from '~/store/settingStore'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navSections = [
  {
    title: 'Home',
    items: [{ name: '首页', description: '网站首页', href: '/', icon: Home }]
  },
  {
    title: '工具及教程',
    items: [
      {
        name: '模拟器及使用教程',
        description: '模拟器及使用教程',
        href: '/tutorial',
        icon: BookUser
      }
    ]
  },
  {
    title: '游戏信息',
    items: [
      {
        name: 'Galgame',
        description: 'Galgame 本体获取',
        href: '/galgame',
        icon: Gamepad2
      },
      {
        name: '补丁和存档',
        description: '游戏补丁与存档',
        href: '/resource',
        icon: FileText
      },
      {
        name: '制作会社',
        description: '按会社浏览游戏',
        href: '/companies',
        icon: Building
      },
      {
        name: '游戏标签',
        description: '按标签浏览游戏',
        href: '/tag',
        icon: Tags
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
      // 关键：延迟一帧触发动画，确保首屏动画正常
      const timer = requestAnimationFrame(() => setIsAnimate(true))
      document.body.style.overflow = 'hidden'
      return () => cancelAnimationFrame(timer)
    } else {
      setIsAnimate(false)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTransitionEnd = () => {
    if (!isOpen) {
      setShouldRender(false)
    }
  }

  const NSFWNotice = () => {
    const isSFW = settings.kunNsfwEnable === 'sfw'
    const isNSFW = settings.kunNsfwEnable === 'nsfw'
    const isAll = settings.kunNsfwEnable === 'all'

    if (isSFW) {
      return (
        <div className="mx-2 mb-2 p-2 bg-primary/20 border border-primary/40 rounded-lg">
          <div className="flex items-start gap-1 text-[10px] leading-tight">
            <Shield className="w-3 h-3 text-danger flex-shrink-0" />
            <span>部分内容已隐藏</span>
          </div>
        </div>
      )
    }
    if (isNSFW || isAll) {
      return (
        <div className="mx-2 mb-2 p-2 bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 rounded-lg text-pink-600 dark:text-pink-400">
          <div className="flex items-start gap-1 text-[10px] leading-tight">
            <Eye className="w-3 h-3 flex-shrink-0" />
            <span>NSFW模式已开启</span>
          </div>
        </div>
      )
    }
    return null
  }

  if (!shouldRender) return null

  return (
    <>
      {/* 遮罩层：修复点击穿透的关键 */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isAnimate ? 'opacity-100' : 'opacity-0 pointer-events-none' // 添加 pointer-events-none
        )}
        onClick={onClose}
      />

      {/* 侧边栏主体：宽度 210px */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 w-[210px] bg-background z-50 flex flex-col',
          'transform transition-transform duration-300 ease-out shadow-2xl',
          isAnimate ? 'translate-x-0' : '-translate-x-full'
        )}
        onTransitionEnd={handleTransitionEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-divider">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <Image
              src="/favicon.webp"
              alt="Logo"
              width={24}
              height={24}
              className="rounded-lg"
            />
            <span className="font-bold text-[13px] text-primary">
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

        {/* 导航列表 */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
          <NSFWNotice />

          {navSections.map((section) => {
            const isAdSection = section.title === '推荐内容'
            return (
              <div
                key={section.title}
                className={cn('mb-3 px-1', isAdSection && 'hidden')}
              >
                {' '}
                {/* 暂时隐藏广告项以简化布局 */}
                {section.title && (
                  <h2 className="px-3 py-1 text-[10px] font-bold uppercase text-default-400 mb-0.5">
                    {section.title}
                  </h2>
                )}
                <ul className="space-y-0.5">
                  {section.items.map((item: any) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-start p-1.5 mx-1.5 rounded-lg transition-colors',
                          pathname === item.href
                            ? 'bg-primary/10 text-primary'
                            : 'active:bg-default-100 text-foreground'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'w-4 h-4 mt-0.5 flex-shrink-0',
                            pathname === item.href
                              ? 'text-primary'
                              : 'text-default-500'
                          )}
                        />
                        <div className="flex flex-col ms-2.5 min-w-0">
                          <span className="text-[12.5px] font-semibold leading-tight">
                            {item.name}
                          </span>
                          <span className="text-[10px] mt-0.5 text-default-400 leading-snug break-words">
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
