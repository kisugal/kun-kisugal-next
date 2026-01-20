'use client'

import { Card, CardBody, Button, Avatar } from '@heroui/react'
import { Users } from 'lucide-react'
import { useUserStore } from '~/store/userStore'
import { useRouter } from 'next/navigation'

export const RightSidebar = () => {
    const { user } = useUserStore()
    const router = useRouter()

    return (
        <aside className="hidden lg:block w-80 flex-shrink-0">
            {/* 游客提示卡片 / 用户信息 */}
            {!user || user.uid === 0 ? (
                <Card>
                    <CardBody className="text-center py-8 space-y-4">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center">
                                <Users className="w-8 h-8 text-default-400" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1">游客用户</h3>
                            <p className="text-sm text-default-500">欢迎来到社区</p>
                        </div>
                        <Button
                            color="primary"
                            className="w-full"
                            onPress={() => router.push('/login')}
                        >
                            发布话题
                        </Button>
                        <Button
                            variant="bordered"
                            className="w-full"
                            onPress={() => router.push('/login')}
                        >
                            登录
                        </Button>
                    </CardBody>
                </Card>
            ) : (
                <Card>
                    <CardBody className="text-center py-6 space-y-3">
                        <Avatar
                            src={user.avatar}
                            className="w-16 h-16 mx-auto"
                            name={user.name}
                        />
                        <div>
                            <h3 className="text-lg font-semibold">{user.name}</h3>
                            <p className="text-sm text-default-500">欢迎回来</p>
                        </div>
                        <Button
                            color="primary"
                            className="w-full"
                            onPress={() => router.push('/topic/create')}
                        >
                            发布话题
                        </Button>
                    </CardBody>
                </Card>
            )}
        </aside>
    )
}
