'use client'

import { useEffect, useState } from 'react'
import { Navbar, NavbarContent, NavbarItem } from '@heroui/navbar'
import Link from 'next/link'
import { Button } from '@heroui/button'
import { Menu } from 'lucide-react'
import { KunTopBarBrand } from './Brand'
import { KunTopBarUser } from './User'
import { usePathname } from 'next/navigation'
import { kunNavItem } from '~/constants/top-bar'
import { MobileSidebar } from './MobileSidebar'
import { Image } from '@heroui/react'

export const KunTopBar = () => {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  return (
    <>
      <Navbar maxWidth="full" classNames={{ wrapper: 'px-3 sm:px-6' }}>
        {/* 左侧内容区 (Logo + 导航链接) */}
        <NavbarContent justify="start">
          <Button
            isIconOnly
            variant="light"
            className="sm:hidden"
            onPress={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <KunTopBarBrand />
          <div className="hidden sm:flex gap-4">
            {kunNavItem.map((item) => (
              <NavbarItem key={item.href} isActive={pathname === item.href}>
                <Link
                  className={
                    pathname === item.href ? 'text-primary' : 'text-foreground'
                  }
                  href={item.href}
                >
                  {item.name}
                </Link>
              </NavbarItem>
            ))}
          </div>
          <div className="lg:hidden">
            <Link href="https://www.duskpine.top?rf=e32c5b70" target="_blank">
              <Image
                src="/moyumoe1-button.avif"
                alt="❤️AI涩涩"
                className="h-7 opacity-80"
              ></Image>
            </Link>
          </div>
        </NavbarContent>

        {/* 右侧内容区 (用户操作) */}
        <NavbarContent justify="end">
          <KunTopBarUser />
        </NavbarContent>
      </Navbar>

      {/* 移动端侧边栏 */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  )
}
