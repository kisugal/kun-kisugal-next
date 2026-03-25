'use client'

import { useEffect, useState, useTransition } from 'react'
import { CommentCard } from './CommentCard'
import { FilterBar } from './FilterBar'
import { KunLoading } from '~/components/kun/Loading'
import { KunHeader } from '../kun/Header'
import { useRouter } from 'next/navigation'
import { KunPagination } from '~/components/kun/Pagination'
import { KunNull } from '~/components/kun/Null'
import type { SortDirection, SortOption } from './_sort'
import type { PatchComment } from '~/types/api/comment'
import { buildCommentQueryString, type CommentQueryState } from './query'

interface Props {
  initialComments: PatchComment[]
  initialTotal: number
  uid?: number
  initialQueryState: CommentQueryState
}

export const CardContainer = ({
  initialComments,
  initialTotal,
  uid,
  initialQueryState
}: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [sortField, setSortField] = useState<SortOption>(
    initialQueryState.sortField
  )
  const [sortOrder, setSortOrder] = useState<SortDirection>(
    initialQueryState.sortOrder
  )
  const [page, setPage] = useState(initialQueryState.page)

  useEffect(() => {
    setSortField(initialQueryState.sortField)
    setSortOrder(initialQueryState.sortOrder)
    setPage(initialQueryState.page)
  }, [initialQueryState])

  const navigate = (
    nextState: CommentQueryState,
    options: { history?: 'push' | 'replace'; scroll?: boolean } = {}
  ) => {
    const queryString = buildCommentQueryString(nextState)
    const href = queryString ? `/comment?${queryString}` : '/comment'
    const { history = 'replace', scroll = false } = options

    startTransition(() => {
      if (history === 'push') {
        router.push(href, { scroll })
        return
      }

      router.replace(href, { scroll })
    })
  }

  const handleSortFieldChange = (value: SortOption) => {
    setSortField(value)
    setPage(1)
    navigate({
      ...initialQueryState,
      sortField: value,
      sortOrder,
      page: 1
    })
  }

  const handleSortOrderChange = (value: SortDirection) => {
    setSortOrder(value)
    setPage(1)
    navigate({
      ...initialQueryState,
      sortField,
      sortOrder: value,
      page: 1
    })
  }

  const handlePageChange = (value: number) => {
    setPage(value)
    navigate(
      {
        ...initialQueryState,
        sortField,
        sortOrder,
        page: value
      },
      { history: 'push', scroll: true }
    )
  }

  return (
    <div className="container mx-auto my-4 space-y-6">
      <KunHeader
        name="Galgame 评论"
        description="这里展示了所有的 Galgame 评论"
      />

      {uid ? (
        <>
          <FilterBar
            sortField={sortField}
            setSortField={handleSortFieldChange}
            sortOrder={sortOrder}
            setSortOrder={handleSortOrderChange}
          />

          {isPending ? (
            <KunLoading hint="正在获取评论数据..." />
          ) : (
            <div className="space-y-4">
              {initialComments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          )}

          {initialTotal > 50 && (
            <div className="flex justify-center">
              <KunPagination
                total={Math.ceil(initialTotal / 50)}
                page={page}
                onPageChange={handlePageChange}
                isLoading={isPending}
              />
            </div>
          )}
        </>
      ) : (
        <KunNull message="请登录后查看所有游戏评论" />
      )}
    </div>
  )
}
