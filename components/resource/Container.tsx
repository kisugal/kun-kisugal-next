'use client'

import { useEffect, useState, useTransition } from 'react'
import { ResourceCard } from './ResourceCard'
import { FilterBar } from './FilterBar'
import { KunLoading } from '~/components/kun/Loading'
import { KunHeader } from '../kun/Header'
import { useRouter } from 'next/navigation'
import { KunPagination } from '~/components/kun/Pagination'
import type { SortDirection, SortOption } from './_sort'
import type { PatchResource } from '~/types/api/resource'
import { buildResourceQueryString, type ResourceQueryState } from './query'

interface Props {
  initialResources: PatchResource[]
  initialTotal: number
  initialQueryState: ResourceQueryState
}

export const CardContainer = ({
  initialResources,
  initialTotal,
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
    nextState: ResourceQueryState,
    options: { history?: 'push' | 'replace'; scroll?: boolean } = {}
  ) => {
    const queryString = buildResourceQueryString(nextState)
    const href = queryString ? `/resource?${queryString}` : '/resource'
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
        name="Galgame 补丁资源"
        description="这里展示了所有的 Galgame 补丁资源列表"
      />

      <FilterBar
        sortField={sortField}
        setSortField={handleSortFieldChange}
        sortOrder={sortOrder}
        setSortOrder={handleSortOrderChange}
      />
      {isPending ? (
        <KunLoading hint="正在获取补丁资源数据..." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2">
          {initialResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
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
    </div>
  )
}
