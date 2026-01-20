import { Suspense } from 'react'
import { TopicListServer } from '~/components/topic/TopicListServer'
import type { Metadata } from 'next'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { Card, CardBody, Skeleton } from '@heroui/react'

export const metadata: Metadata = {
    metadataBase: new URL(kunMoyuMoe.domain.main),
    title: {
        default: kunMoyuMoe.title,
        template: kunMoyuMoe.template
    },
    description: kunMoyuMoe.description,
    keywords: kunMoyuMoe.keywords,
    authors: kunMoyuMoe.author
}

// 启用 ISR - 每 60 秒重新验证一次缓存
export const revalidate = 60

// 生成静态参数
export async function generateStaticParams() {
    return [
        { page: '1', tab: 'official' },
        { page: '1', tab: 'all' },
        { page: '1', tab: 'image' }
    ]
}

// 复用骨架屏组件
function TopicListLoading() {
    return (
        <div className="container mx-auto my-4">
            <div className="flex gap-6">
                <div className="flex-1 min-w-0 space-y-6">
                    <Card>
                        <CardBody className="p-0">
                            <div className="flex gap-4 p-4">
                                <Skeleton className="h-8 w-20 rounded-lg" />
                                <Skeleton className="h-8 w-20 rounded-lg" />
                                <Skeleton className="h-8 w-20 rounded-lg" />
                                <Skeleton className="h-8 w-20 rounded-lg" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-32 rounded-lg" />
                                <Skeleton className="h-10 w-24 rounded-lg" />
                            </div>
                        </CardBody>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}>
                                <CardBody className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-24 rounded-lg" />
                                            <Skeleton className="h-3 w-32 rounded-lg" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                                    <Skeleton className="h-20 w-full rounded-lg" />
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="hidden lg:block w-80 space-y-4">
                    <Card>
                        <CardBody className="space-y-3">
                            <Skeleton className="h-6 w-32 rounded-lg" />
                            <Skeleton className="h-4 w-full rounded-lg" />
                            <Skeleton className="h-4 w-full rounded-lg" />
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    )
}

// 服务端组件 - 直接在服务器获取数据
export default async function KunOptimized({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    return (
        <Suspense fallback={<TopicListLoading />}>
            <TopicListServer searchParams={searchParams} />
        </Suspense>
    )
}
