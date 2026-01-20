'use client'

import { useState, useEffect, useTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Select, SelectItem, Tabs, Tab, Skeleton } from '@heroui/react'
import { Filter } from 'lucide-react'
import { TopicList } from './TopicList'
import { KunPagination } from '~/components/kun/Pagination'
import { kunFetchGet } from '~/utils/kunFetch'
import type { TopicCard } from '~/types/api/topic'
import dynamic from 'next/dynamic'

// 动态加载右侧边栏，不阻塞首屏
const RightSidebar = dynamic(() => import('~/components/layout/RightSidebar').then(mod => ({ default: mod.RightSidebar })), {
    ssr: false,
    loading: () => (
        <div className="hidden lg:block w-80 space-y-4">
            <Card>
                <CardBody className="space-y-3">
                    <Skeleton className="h-6 w-32 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                </CardBody>
            </Card>
        </div>
    )
})

interface TopicListResponse {
    topics: TopicCard[]
    total: number
    page: number
    limit: number
}

type TabType = 'following' | 'all' | 'official' | 'image'

const sortOptions = [
    { key: 'created', label: '最新发布' },
    { key: 'view_count', label: '浏览最多' },
    { key: 'like_count', label: '点赞最多' }
]

const orderOptions = [
    { key: 'desc', label: '降序' },
    { key: 'asc', label: '升序' }
]

interface Props {
    initialTopics?: TopicCard[]
    initialTotal?: number
    initialPage?: number
    initialSortField?: string
    initialSortOrder?: string
    initialTab?: TabType
}

export const TopicListClient = ({
    initialTopics = [],
    initialTotal = 0,
    initialPage = 1,
    initialSortField = 'created',
    initialSortOrder = 'desc',
    initialTab = 'official'
}: Props) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [topics, setTopics] = useState<TopicCard[]>(initialTopics)
    const [isPending, startTransition] = useTransition()
    const [total, setTotal] = useState(initialTotal)
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [sortField, setSortField] = useState(initialSortField)
    const [sortOrder, setSortOrder] = useState(initialSortOrder)
    const [activeTab, setActiveTab] = useState<TabType>(initialTab)
    const limit = 10

    const fetchTopics = async (
        page: number = 1,
        sort: string = 'created',
        order: string = 'desc',
        tab: TabType = 'official'
    ) => {
        startTransition(async () => {
            try {
                let url = `/api/topic?page=${page}&limit=${limit}&sortField=${sort}&sortOrder=${order}`

                // 根据标签页添加不同的过滤条件
                if (tab === 'following') {
                    url += '&type=following'
                } else if (tab === 'image') {
                    url += '&type=image'
                } else if (tab === 'official') {
                    url += '&username=kisushiina'
                }

                const response = await kunFetchGet<TopicListResponse>(url)
                setTopics(response.topics)
                setTotal(response.total)
                setCurrentPage(response.page)
            } catch (error) {
                console.error('获取话题列表失败:', error)
            }
        })
    }

    const updateURL = (page: number, sort: string, order: string, tab: TabType) => {
        const params = new URLSearchParams()
        if (page > 1) params.set('page', page.toString())
        if (sort !== 'created') params.set('sortField', sort)
        if (order !== 'desc') params.set('sortOrder', order)
        if (tab !== 'official') params.set('tab', tab)

        const newURL = params.toString() ? `/?${params.toString()}` : '/'
        router.replace(newURL, { scroll: false })
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        updateURL(page, sortField, sortOrder, activeTab)
        fetchTopics(page, sortField, sortOrder, activeTab)
    }

    const handleSortChange = (field: string, order: string) => {
        setSortField(field)
        setSortOrder(order)
        setCurrentPage(1)
        updateURL(1, field, order, activeTab)
        fetchTopics(1, field, order, activeTab)
    }

    const handleTabChange = (key: string | number) => {
        const tab = key as TabType
        setActiveTab(tab)
        setCurrentPage(1)
        updateURL(1, sortField, sortOrder, tab)
        fetchTopics(1, sortField, sortOrder, tab)
    }

    useEffect(() => {
        // 如果有初始数据，不需要再次获取
        if (initialTopics.length > 0) {
            return
        }

        // 从URL参数初始化状态
        const page = parseInt(searchParams.get('page') || '1')
        const sort = searchParams.get('sortField') || 'created'
        const order = searchParams.get('sortOrder') || 'desc'
        const tab = (searchParams.get('tab') || 'official') as TabType

        setCurrentPage(page)
        setSortField(sort)
        setSortOrder(order)
        setActiveTab(tab)

        fetchTopics(page, sort, order, tab)
    }, [])

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="container mx-auto my-4">
            <div className="flex gap-6">
                {/* 主内容区域 */}
                <div className="flex-1 min-w-0 space-y-6">
                    {/* 标签页导航 */}
                    <Card>
                        <CardBody className="p-0">
                            <Tabs
                                selectedKey={activeTab}
                                onSelectionChange={handleTabChange}
                                variant="underlined"
                                classNames={{
                                    tabList: "w-full relative rounded-none p-0 border-b border-divider",
                                    cursor: "w-full bg-primary",
                                    tab: "max-w-fit px-6 h-12",
                                    tabContent: "group-data-[selected=true]:text-primary"
                                }}
                            >
                                <Tab key="following" title="关注" />
                                <Tab key="all" title="全部" />
                                <Tab key="official" title="官方" />
                                <Tab key="image" title="图片" />
                            </Tabs>
                        </CardBody>
                    </Card>

                    {/* 筛选和排序 */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Filter className="size-4" />
                                <span className="font-medium">筛选和排序</span>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-foreground/70">排序方式:</span>
                                    <Select
                                        size="sm"
                                        selectedKeys={[sortField]}
                                        onSelectionChange={(keys) => {
                                            const field = Array.from(keys)[0] as string
                                            handleSortChange(field, sortOrder)
                                        }}
                                        className="w-32"
                                    >
                                        {sortOptions.map((option) => (
                                            <SelectItem key={option.key}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-foreground/70">排序:</span>
                                    <Select
                                        size="sm"
                                        selectedKeys={[sortOrder]}
                                        onSelectionChange={(keys) => {
                                            const order = Array.from(keys)[0] as string
                                            handleSortChange(sortField, order)
                                        }}
                                        className="w-20"
                                    >
                                        {orderOptions.map((option) => (
                                            <SelectItem key={option.key}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* 内容区域 */}
                    {isPending && topics.length === 0 ? (
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
                    ) : (
                        // 话题列表
                        <TopicList topics={topics} columns={2} />
                    )}

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <KunPagination
                                total={totalPages}
                                page={currentPage}
                                onPageChange={handlePageChange}
                                isLoading={isPending}
                            />
                        </div>
                    )}
                </div>

                {/* 右侧边栏 */}
                <RightSidebar />
            </div>
        </div>
    )
}

