'use client'

import { useEffect, useState } from 'react'
import { User } from '@heroui/react'
import { kunFetchGet } from '~/utils/kunFetch'
import { KunUserStatCard } from './KunUserStatCard'
import { KunLoading } from '../Loading'
import { UserFollow } from '~/components/user/follow/Follow'
import type { FloatingCardUser } from '~/types/api/user'

interface UserCardProps {
  uid: number
}

export const KunUserCard = ({ uid }: UserCardProps) => {
  const [user, setUser] = useState<FloatingCardUser | null>(null)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    // reset state before starting a new request for a different uid
    setError(false)
    setUser(null)

    const fetchData = async () => {
      try {
        const user = await kunFetchGet<FloatingCardUser>(
          '/api/user/profile/floating',
          { uid }
        )
        if (typeof user === 'string') {
          setError(true)
        } else {
          setError(false)
          setUser(user)
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        setError(true)
      }
    }
    fetchData()
  }, [uid])

  return (
    <div className="p-2 w-[300px]">
      {error ? (
        <div className="p-4 text-center text-sm text-default-500">
          获取用户资料失败
        </div>
      ) : user ? (
        <>
          <div className="flex items-center justify-between">
            <User
              name={user.name}
              description={user.bio || '这只笨萝莉还没有签名'}
              avatarProps={{
                src: user.avatar,
                isBordered: true,
                color: 'secondary',
                className: 'w-12 h-12 shrink-0'
              }}
              className="mb-2"
            />

            <UserFollow
              uid={user.id}
              name={user.name}
              follow={user.isFollow}
              fullWidth={false}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <KunUserStatCard value={user._count.follower} label="关注者" />
            <KunUserStatCard value={user._count.patch} label="Galgame 数" />
            <KunUserStatCard
              value={user._count.patch_resource}
              label="补丁数"
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-36">
          <KunLoading hint="正在加载用户信息..." />
        </div>
      )}
    </div>
  )
}
