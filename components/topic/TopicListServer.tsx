import { TopicListClient } from './TopicListClient'
import { prisma } from '~/prisma/index'
import type { TopicCard } from '~/types/api/topic'
import { unstable_cache } from 'next/cache'

interface TopicListResponse {
    topics: TopicCard[]
    total: number
    page: number
    limit: number
}

type TabType = 'following' | 'all' | 'official' | 'image'

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// 缓存的数据获取函数
const getCachedTopics = unstable_cache(
    async (page: number, sortField: string, sortOrder: string, tab: TabType, limit: number) => {
        const skip = (page - 1) * limit
        let where: any = {
            status: 0  // 只显示未删除的话题
        }

        if (tab === 'official') {
            const officialUser = await prisma.user.findUnique({
                where: { name: 'kisushiina' },
                select: { id: true }
            })
            if (officialUser) {
                where.user_id = officialUser.id
            }
        } else if (tab === 'image') {
            where.content = { contains: '![' }
        }

        const orderBy: any = {}
        orderBy[sortField] = sortOrder

        const [topics, total] = await Promise.all([
            prisma.topic.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    created: true,
                    updated: true,
                    view_count: true,
                    like_count: true,
                    is_pinned: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    },
                    _count: {
                        select: {
                            topic_comments: true
                        }
                    }
                }
            }),
            prisma.topic.count({ where })
        ])

        // 转换数据格式，添加 comment_count
        const formattedTopics = topics.map(topic => ({
            ...topic,
            comment_count: topic._count.topic_comments,
            _count: undefined
        }))

        return { topics: formattedTopics as any, total, page, limit }
    },
    ['topic-list'],
    {
        revalidate: 60, // 60 秒缓存
        tags: ['topics']
    }
)

// 服务端组件 - 在服务器获取初始数据（带缓存）
export async function TopicListServer({ searchParams }: Props) {
    const params = await searchParams
    const page = parseInt((params.page as string) || '1')
    const sortField = (params.sortField as string) || 'created'
    const sortOrder = (params.sortOrder as string) || 'desc'
    const tab = (params.tab as TabType) || 'official'
    const limit = 10

    try {
        // 使用缓存的数据获取函数
        const initialData = await getCachedTopics(page, sortField, sortOrder, tab, limit)

        // 将服务端获取的数据传递给客户端组件
        return (
            <TopicListClient
                initialTopics={initialData.topics}
                initialTotal={initialData.total}
                initialPage={initialData.page}
                initialSortField={sortField}
                initialSortOrder={sortOrder}
                initialTab={tab}
            />
        )
    } catch (error) {
        console.error('服务端获取话题列表失败:', error)
        // 失败时仍然渲染客户端组件，让它自己获取数据
        return <TopicListClient />
    }
}
