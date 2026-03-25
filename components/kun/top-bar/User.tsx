'use client'

import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { NavbarContent, NavbarItem } from '@heroui/navbar'
import Link from 'next/link'
import { Button } from '@heroui/button'
import { Skeleton } from '@heroui/skeleton'
import { useUserStore } from '~/store/userStore'
import { useRouter } from '@bprogress/next'
import { KunFetchError, kunFetchGet } from '~/utils/kunFetch'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useMounted } from '~/hooks/useMounted'
import { UserDropdown } from './UserDropdown'
import { KunSearch } from './Search'
import { UserMessageBell } from './UserMessageBell'
import { Tooltip } from '@heroui/tooltip'
import { RandomGalgameButton } from '~/components/home/carousel/RandomGalgameButton'
import { NSFWSwitcher } from './NSFWSwitcher'
import type { UserState } from '~/store/userStore'
import type { Message } from '~/types/api/message'

export const KunTopBarUser = () => {
  const router = useRouter()
  const { user, setUser, logout } = useUserStore((state) => state)
  const [hasUnread, setHasUnread] = useState(false)
  const isMounted = useMounted()

  useEffect(() => {
    if (!isMounted) {
      return
    }
    // 只有当用户已登录（uid > 0 且有name）时才调用API
    if (!user.uid || user.uid === 0 || !user.name) {
      return
    }

    let cancelled = false

    const syncUserStatus = async () => {
      try {
        const status =
          await kunFetchGet<KunResponse<UserState>>('/api/user/status')

        if (cancelled) {
          return
        }

        if (typeof status === 'string') {
          setHasUnread(false)
          logout()
          toast.error(status)
          router.push('/login')
          return
        }

        setUser(status)

        try {
          const message = await kunFetchGet<Message | null>(
            '/api/message/unread'
          )
          if (!cancelled) {
            setHasUnread(Boolean(message))
          }
        } catch (error) {
          if (cancelled) {
            return
          }

          if (error instanceof KunFetchError && error.status === 401) {
            setHasUnread(false)
            logout()
            return
          }

          throw error
        }
      } catch (error) {
        if (!cancelled) {
          setHasUnread(false)
          console.error('Failed to sync top bar user status', error)
        }
      }
    }

    void syncUserStatus()

    return () => {
      cancelled = true
    }
  }, [isMounted, logout, router, setUser, user.uid, user.name])

  return (
    <NavbarContent as="div" className="items-center" justify="end">
      {isMounted ? (
        <>
          {!user.name && (
            <NavbarContent justify="end">
              <NavbarItem className="hidden lg:flex">
                <Link href="/login">登录</Link>
              </NavbarItem>
              <NavbarItem>
                <Button
                  as={Link}
                  color="primary"
                  href="/register"
                  variant="flat"
                  className="hidden lg:flex"
                >
                  注册
                </Button>
              </NavbarItem>
              <NavbarItem className="flex lg:hidden">
                <Button as={Link} color="primary" href="/login" variant="flat">
                  登录
                </Button>
              </NavbarItem>
            </NavbarContent>
          )}

          <KunSearch />

          {/* <Tooltip
            disableAnimation
            showArrow
            closeDelay={0}
            content="随机一部游戏"
          >
            <RandomGalgameButton isIconOnly variant="light" />
          </Tooltip> */}

          <ThemeSwitcher />

          <NSFWSwitcher />

          {user.name && (
            <>
              <UserMessageBell
                hasUnreadMessages={hasUnread}
                setReadMessage={() => setHasUnread(false)}
              />

              <UserDropdown />
            </>
          )}
        </>
      ) : (
        <Skeleton className="rounded-lg">
          <div className="w-32 h-10 rounded-lg bg-default-300" />
        </Skeleton>
      )}
    </NavbarContent>
  )
}
