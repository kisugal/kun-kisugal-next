'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { kunFetchGet } from '~/utils/kunFetch'
import { GalgameCard } from './Card'
import { FilterBar } from './FilterBar'
import { useMounted } from '~/hooks/useMounted'
import { KunHeader } from '../kun/Header'
import { KunPagination } from '../kun/Pagination'
import type { SortField, SortOrder } from './_sort'

interface Props {
  initialGalgames: GalgameCard[]
  initialTotal: number
}

// 从 URL 解析参数的辅助函数
const parseURLParams = () => {
  if (typeof window === 'undefined') {
    return {
      page: 1,
      type: 'all',
      language: 'all',
      platform: 'all',
      sortField: 'resource_update_time' as SortField,
      sortOrder: 'desc' as SortOrder,
      years: ['all'],
      months: ['all']
    }
  }

  const params = new URLSearchParams(window.location.search)
  return {
    page: params.get('page') ? parseInt(params.get('page')!, 10) : 1,
    type: params.get('type') || 'all',
    language: params.get('language') || 'all',
    platform: params.get('platform') || 'all',
    sortField: (params.get('sortField') as SortField) || 'resource_update_time',
    sortOrder: (params.get('sortOrder') as SortOrder) || 'desc',
    years: params.get('years') ? params.get('years')!.split(',') : ['all'],
    months: params.get('months') ? params.get('months')!.split(',') : ['all']
  }
}

export const CardContainer = ({ initialGalgames, initialTotal }: Props) => {
  const isMounted = useMounted()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isUserAction = useRef(false)

  const [galgames, setGalgames] = useState<GalgameCard[]>(initialGalgames)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)

  // 初始化状态
  const initialParams = parseURLParams()
  const [selectedType, setSelectedType] = useState<string>(initialParams.type)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    initialParams.language
  )
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    initialParams.platform
  )
  const [sortField, setSortField] = useState<SortField>(initialParams.sortField)
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialParams.sortOrder)
  const [selectedYears, setSelectedYears] = useState<string[]>(
    initialParams.years
  )
  const [selectedMonths, setSelectedMonths] = useState<string[]>(
    initialParams.months
  )
  const [page, setPage] = useState(initialParams.page)

  // 更新 URL 参数
  const updateURL = useCallback(
    (
      newPage: number,
      type: string,
      language: string,
      platform: string,
      field: SortField,
      order: SortOrder,
      years: string[],
      months: string[]
    ) => {
      const params = new URLSearchParams()

      if (newPage > 1) params.set('page', newPage.toString())
      if (type !== 'all') params.set('type', type)
      if (language !== 'all') params.set('language', language)
      if (platform !== 'all') params.set('platform', platform)
      if (field !== 'resource_update_time') params.set('sortField', field)
      if (order !== 'desc') params.set('sortOrder', order)
      if (!years.includes('all')) params.set('years', years.join(','))
      if (!months.includes('all')) params.set('months', months.join(','))

      const queryString = params.toString()
      const newURL = queryString ? `${pathname}?${queryString}` : pathname

      router.push(newURL, { scroll: false })
    },
    [pathname, router]
  )

  const fetchPatches = useCallback(
    async (
      currentPage: number,
      type: string,
      language: string,
      platform: string,
      field: SortField,
      order: SortOrder,
      years: string[],
      months: string[]
    ) => {
      setLoading(true)

      const { galgames, total } = await kunFetchGet<{
        galgames: GalgameCard[]
        total: number
      }>('/api/galgame', {
        selectedType: type,
        selectedLanguage: language,
        selectedPlatform: platform,
        sortField: field,
        sortOrder: order,
        page: currentPage,
        limit: 24,
        yearString: JSON.stringify(years),
        monthString: JSON.stringify(months)
      })

      setGalgames(galgames)
      setTotal(total)
      setLoading(false)
    },
    []
  )

  // 从 URL 同步状态并获取数据
  const syncFromURL = useCallback(() => {
    const params = parseURLParams()

    setPage(params.page)
    setSelectedType(params.type)
    setSelectedLanguage(params.language)
    setSelectedPlatform(params.platform)
    setSortField(params.sortField)
    setSortOrder(params.sortOrder)
    setSelectedYears(params.years)
    setSelectedMonths(params.months)

    fetchPatches(
      params.page,
      params.type,
      params.language,
      params.platform,
      params.sortField,
      params.sortOrder,
      params.years,
      params.months
    )
  }, [fetchPatches])

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
    // 如果不是第一页或有筛选条件，需要获取数据
    if (
      params.page > 1 ||
      params.type !== 'all' ||
      params.language !== 'all' ||
      params.platform !== 'all' ||
      params.sortField !== 'resource_update_time' ||
      params.sortOrder !== 'desc' ||
      !params.years.includes('all') ||
      !params.months.includes('all')
    ) {
      syncFromURL()
    }
  }, [isMounted])

  // 用户操作：筛选条件变化时，重置到第一页
  const handleFilterChange = useCallback(
    (
      type: string,
      language: string,
      platform: string,
      field: SortField,
      order: SortOrder,
      years: string[],
      months: string[]
    ) => {
      isUserAction.current = true
      setPage(1)
      setSelectedType(type)
      setSelectedLanguage(language)
      setSelectedPlatform(platform)
      setSortField(field)
      setSortOrder(order)
      setSelectedYears(years)
      setSelectedMonths(months)
      fetchPatches(1, type, language, platform, field, order, years, months)
      updateURL(1, type, language, platform, field, order, years, months)
    },
    [fetchPatches, updateURL]
  )

  // 用户操作：页码变化
  const handlePageChange = useCallback(
    (newPage: number) => {
      isUserAction.current = true
      setPage(newPage)
      fetchPatches(
        newPage,
        selectedType,
        selectedLanguage,
        selectedPlatform,
        sortField,
        sortOrder,
        selectedYears,
        selectedMonths
      )
      updateURL(
        newPage,
        selectedType,
        selectedLanguage,
        selectedPlatform,
        sortField,
        sortOrder,
        selectedYears,
        selectedMonths
      )
    },
    [
      selectedType,
      selectedLanguage,
      selectedPlatform,
      sortField,
      sortOrder,
      selectedYears,
      selectedMonths,
      fetchPatches,
      updateURL
    ]
  )

  // 包装 setter 函数
  const handleTypeChange = (type: string) => {
    handleFilterChange(
      type,
      selectedLanguage,
      selectedPlatform,
      sortField,
      sortOrder,
      selectedYears,
      selectedMonths
    )
  }
  const handleLanguageChange = (language: string) => {
    handleFilterChange(
      selectedType,
      language,
      selectedPlatform,
      sortField,
      sortOrder,
      selectedYears,
      selectedMonths
    )
  }
  const handlePlatformChange = (platform: string) => {
    handleFilterChange(
      selectedType,
      selectedLanguage,
      platform,
      sortField,
      sortOrder,
      selectedYears,
      selectedMonths
    )
  }
  const handleSortFieldChange = (field: SortField) => {
    handleFilterChange(
      selectedType,
      selectedLanguage,
      selectedPlatform,
      field,
      sortOrder,
      selectedYears,
      selectedMonths
    )
  }
  const handleSortOrderChange = (order: SortOrder) => {
    handleFilterChange(
      selectedType,
      selectedLanguage,
      selectedPlatform,
      sortField,
      order,
      selectedYears,
      selectedMonths
    )
  }
  const handleYearsChange = (years: string[]) => {
    handleFilterChange(
      selectedType,
      selectedLanguage,
      selectedPlatform,
      sortField,
      sortOrder,
      years,
      selectedMonths
    )
  }
  const handleMonthsChange = (months: string[]) => {
    handleFilterChange(
      selectedType,
      selectedLanguage,
      selectedPlatform,
      sortField,
      sortOrder,
      selectedYears,
      months
    )
  }

  return (
    <div className="container mx-auto my-4 space-y-6">
      <KunHeader
        name="Galgame"
        description="这里展示了本站所有的 Galgame, 您可以点击进入以下载 Galgame 资源"
      />

      <FilterBar
        selectedType={selectedType}
        setSelectedType={handleTypeChange}
        sortField={sortField}
        setSortField={handleSortFieldChange}
        sortOrder={sortOrder}
        setSortOrder={handleSortOrderChange}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={handleLanguageChange}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={handlePlatformChange}
        selectedYears={selectedYears}
        setSelectedYears={handleYearsChange}
        selectedMonths={selectedMonths}
        setSelectedMonths={handleMonthsChange}
      />

      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 xl:grid-cols-6">
        {galgames.map((pa) => (
          <GalgameCard key={pa.id} patch={pa} />
        ))}
      </div>

      {total > 24 && (
        <div className="flex justify-center">
          <KunPagination
            total={Math.ceil(total / 24)}
            page={page}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  )
}