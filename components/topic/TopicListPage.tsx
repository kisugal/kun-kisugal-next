'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem
} from '@heroui/react'
import { Plus, Filter } from 'lucide-react'
import { TopicList } from './TopicList'
import { KunPagination } from '~/components/kun/Pagination'
import type { TopicCard } from '~/types/api/topic'
import { useUserStore } from '~/store/userStore'
import toast from 'react-hot-toast'
import { buildTopicQueryString, type TopicQueryState } from './query'

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
  initialTopics: TopicCard[]
  initialTotal: number
  initialQueryState: TopicQueryState
}

export const TopicListPage = ({
  initialTopics,
  initialTotal,
  initialQueryState
}: Props) => {
  const { user } = useUserStore()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentPage, setCurrentPage] = useState(initialQueryState.page)
  const [sortField, setSortField] = useState(initialQueryState.sortField)
  const [sortOrder, setSortOrder] = useState(initialQueryState.sortOrder)
  const limit = initialQueryState.limit

  useEffect(() => {
    setCurrentPage(initialQueryState.page)
    setSortField(initialQueryState.sortField)
    setSortOrder(initialQueryState.sortOrder)
  }, [initialQueryState])

  const updateURL = (
    page: number,
    sort: string,
    order: string,
    options: { history?: 'push' | 'replace'; scroll?: boolean } = {}
  ) => {
    const queryString = buildTopicQueryString({
      ...initialQueryState,
      page,
      sortField: sort as TopicQueryState['sortField'],
      sortOrder: order as TopicQueryState['sortOrder']
    })
    const newURL = queryString ? `/topic?${queryString}` : '/topic'
    const { history = 'replace', scroll = false } = options

    startTransition(() => {
      if (history === 'push') {
        router.push(newURL, { scroll })
        return
      }

      router.replace(newURL, { scroll })
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURL(page, sortField, sortOrder, {
      history: 'push',
      scroll: true
    })
  }

  const handleSortChange = (
    field: TopicQueryState['sortField'],
    order: TopicQueryState['sortOrder']
  ) => {
    setSortField(field)
    setSortOrder(order)
    setCurrentPage(1)
    updateURL(1, field, order)
  }

  const totalPages = Math.ceil(initialTotal / limit)

  return (
    <div className="container mx-auto my-4 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">话题列表</h1>
          <p className="text-sm text-foreground/60 mt-1">
            共 {initialTotal} 个话题
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="size-4" />}
          onPress={() => {
            if (!user || user.uid === 0) {
              toast.error('请先登录后发布话题')
              return
            }
            router.push('/topic/create')
          }}
        >
          发布话题
        </Button>
      </div>

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
                  handleSortChange(
                    field as TopicQueryState['sortField'],
                    sortOrder
                  )
                }}
                className="w-32"
              >
                {sortOptions.map((option) => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
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
                  handleSortChange(
                    sortField,
                    order as TopicQueryState['sortOrder']
                  )
                }}
                className="w-20"
              >
                {orderOptions.map((option) => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 话题列表 */}
      {isPending ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">加载中...</div>
        </div>
      ) : (
        <TopicList topics={initialTopics} columns={2} />
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
  )
}
