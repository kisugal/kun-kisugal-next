'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
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
    HeartMinus,
    ClipboardList,
    X,
    HeartIcon
} from 'lucide-react'
import { Button } from '@heroui/button'
import { memo, useEffect, useState } from 'react'

interface MobileSidebarProps {
    isOpen: boolean
    onClose: () => void
}

const navSections = [
    {
        title: null,
        items: [{ name: '首页', href: '/', icon: Home }]
    },
    {
        title: '游戏信息',
        items: [
            { name: 'Galgame', href: '/galgame', icon: Gamepad2 },
            { name: '补丁和存档', href: '/resource', icon: FileText },
            { name: '开发商', href: '/companies', icon: Building },
            { name: '游戏标签', href: '/tag', icon: Tags }
        ]
    },
    {
        title: '社区交流',
        items: [
            { name: '社区评论', href: '/comment', icon: MessagesSquare },
            { name: '社区话题', href: '/topic', icon: Hash }
        ]
    },
    {
        title: '其他',
        items: [
            { name: '友情链接', href: '/friend-link', icon: HeartMinus },
            { name: '待办事项', href: '/todo', icon: ClipboardList }
        ]
    },
    {
        title: '推荐内容',
        items: [
            {
                name: 'Ai女友💋',
                href: 'https://genrati.xyz?ref_id=006f5ccb-b0d3-471b-a674-de5e5114ed67',
                icon: HeartIcon
            },
            {
                name: '⚡️翻墙Vpn推荐',
                href: 'https://eueua.cc/#/register?code=V437MLYw',
                icon: HeartIcon
            },
            {
                name: '哔咔漫画',
                href: 'https://wrkb-tj.fukmaydt.com/?ch=m1f1v8bk',
                icon: HeartIcon
            },
            {   name: '精品飞机杯',
                href: 'https://detail.tmall.com/item.htm?id=1018649046685&spm=a21dvs.23580594.0.0.1e1f645eDQUnq8',
                icon: HeartIcon
            },
            {   name: '黄油圈',
                href: 'https://l8.rsjkwh.com/dh980',
                icon: HeartIcon
            }
        ]
    }
]

const MobileSidebarComponent = ({ isOpen, onClose }: MobileSidebarProps) => {
    const pathname = usePathname()
    const router = useRouter()
    const [shouldRender, setShouldRender] = useState(isOpen)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            setShouldRender(true)
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const handleTransitionEnd = (e: React.TransitionEvent) => {
        // 只处理侧边栏本身的 transform 动画结束
        if (e.propertyName !== 'transform') return

        if (!isOpen) {
            setShouldRender(false)
        }
    }

    // 点击链接时关闭侧边栏
    const handleLinkClick = () => {
        onClose()
    }

    if (!shouldRender) return null

    return (
        <>
            {/* 背景遮罩 */}
            <div
                className={cn(
                    'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* 侧边栏 */}
            <div
                className={cn(
                    'fixed top-0 left-0 bottom-0 w-[220px] bg-background z-50',
                    'transform transition-transform duration-300 ease-out',
                    'shadow-xl',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
                onTransitionEnd={handleTransitionEnd}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-divider">
                    <Link
                        href="/"
                        className="flex items-center gap-3"
                        onClick={handleLinkClick}
                    >
                        <Image
                            src="/favicon.webp"
                            alt={kunMoyuMoe.titleShort}
                            width={40}
                            height={40}
                            className="rounded-lg"
                            priority
                        />
                        <div>
                            <p className="text-lg font-bold text-primary">
                                {kunMoyuMoe.creator.name}
                            </p>
                            <p className="text-xs text-default-500">探索精彩游戏世界</p>
                        </div>
                    </Link>
                    <Button isIconOnly variant="light" size="sm" onPress={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-2 h-[calc(100vh-80px)]">
                    {navSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-2">
                            {section.title && (
                                <p className="px-4 py-1 text-xs font-semibold text-default-400 uppercase">
                                    {section.title}
                                </p>
                            )}
                            <ul>
                                {section.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={handleLinkClick}
                                            className={cn(
                                                'flex items-center gap-3 px-4 py-2 mx-2 rounded-lg',
                                                'transition-colors duration-150',
                                                pathname === item.href
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-foreground active:bg-default-100'
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    'w-5 h-5 flex-shrink-0',
                                                    pathname === item.href
                                                        ? 'text-primary'
                                                        : 'text-default-500'
                                                )}
                                            />
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export const MobileSidebar = memo(MobileSidebarComponent)
