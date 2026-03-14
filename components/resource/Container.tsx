'use client'

import { useEffect, useState, useCallback } from 'react'
import { kunFetchGet } from '~/utils/kunFetch'
import { ResourceCard } from './ResourceCard'
import { FilterBar } from './FilterBar'
import { useMounted } from '~/hooks/useMounted'
import { KunLoading } from '~/components/kun/Loading'
import { KunHeader } from '../kun/Header'
import { useRouter, usePathname } from 'next/navigation'
import { KunPagination } from '~/components/kun/Pagination'
import type { SortDirection, SortOption } from './_sort'
import type { PatchResource } from '~/types/api/resource'

interface Props {
  initialResources: PatchResource[]
  initialTotal: number
}

// 从 URL 解析参数
const parseURLParams = () => {
  if (typeof window === 'undefined') {
    return {
      page: 1,
      sortField: 'created' as SortOption,
      sortOrder: 'desc' as SortDirection
    }
  }

  const params = new URLSearchParams(window.location.search)
  return {
    page: params.get('page') ? parseInt(params.get('page')!, 10) : 1,
    sortField: (params.get('sortField') as SortOption) || 'created',
    sortOrder: (params.get('sortOrder') as SortDirection) || 'desc'
  }
}

export const CardContainer = ({ initialResources, initialTotal }: Props) => {
  const [resources, setResources] = useState<PatchResource[]>(initialResources)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const isMounted = useMounted()
  const router = useRouter()
  const pathname = usePathname()

  const initialParams = parseURLParams()
  const [sortField, setSortField] = useState<SortOption>(initialParams.sortField)
  const [sortOrder, setSortOrder] = useState<SortDirection>(
    initialParams.sortOrder
  )
  const [page, setPage] = useState(initialParams.page)

  // 更新 URL 参数
  const updateURL = useCallback(
    (newPage: number, field: SortOption, order: SortDirection) => {
      const params = new URLSearchParams()

      if (newPage > 1) params.set('page', newPage.toString())
      if (field !== 'created') params.set('sortField', field)
      if (order !== 'desc') params.set('sortOrder', order)

      const queryString = params.toString()
      const newURL = queryString ? `${pathname}?${queryString}` : pathname

      router.push(newURL, { scroll: false })
    },
    [pathname, router]
  )

  const fetchData = useCallback(
    async (currentPage: number, field: SortOption, order: SortDirection) => {
      setLoading(true)

      const { resources } = await kunFetchGet<{
        resources: PatchResource[]
        total: number
      }>('/api/resource', {
        sortField: field,
        sortOrder: order,
        page: currentPage,
        limit: 50
      })

      setResources(resources)
      setTotal(total)
      setLoading(false)
    },
    [total]
  )

  // 从 URL 同步状态并获取数据
  const syncFromURL = useCallback(() => {
    const params = parseURLParams()

    setPage(params.page)
    setSortField(params.sortField)
    setSortOrder(params.sortOrder)

    fetchData(params.page, params.sortField, params.sortOrder)
  }, [fetchData])

  // 监听浏览器前进/后退
  useEffect(() => {
    const handlePopState = () => {
      syncFromURL()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [syncFromURL])

  // 初始加载时，如果 URL 有参数则获取对应数据
  useEffect(() => {
    if (!isMounted) return

    const params = parseURLParams()
    if (
      params.page > 1 ||
      params.sortField !== 'created' ||
      params.sortOrder !== 'desc'
    ) {
      syncFromURL()
    }
  }, [isMounted])

  // 用户操作：排序变化
  const handleSortFieldChange = (field: SortOption) => {
    setPage(1)
    setSortField(field)
    fetchData(1, field, sortOrder)
    updateURL(1, field, sortOrder)
  }

  const handleSortOrderChange = (order: SortDirection) => {
    setPage(1)
    setSortOrder(order)
    fetchData(1, sortField, order)
    updateURL(1, sortField, order)
  }

  // 用户操作：页码变化
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchData(newPage, sortField, sortOrder)
    updateURL(newPage, sortField, sortOrder)
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
      {loading ? (
        <KunLoading hint="正在获取补丁资源数据..." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}

      {total > 50 && (
        <div className="flex justify-center">
          <KunPagination
            total={Math.ceil(total / 50)}
            page={page}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  )
}
