'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { GalgameCard } from './Card'
import { FilterBar } from './FilterBar'
import { KunHeader } from '../kun/Header'
import { KunPagination } from '../kun/Pagination'
import type { SortField, SortOrder } from './_sort'
import { buildGalgameQueryString, type GalgameQueryState } from './query'

interface Props {
  initialGalgames: GalgameCard[]
  initialTotal: number
  initialQueryState: GalgameQueryState
}

export const CardContainer = ({
  initialGalgames,
  initialTotal,
  initialQueryState
}: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedType, setSelectedType] = useState<string>(
    initialQueryState.selectedType
  )
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    initialQueryState.selectedLanguage
  )
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    initialQueryState.selectedPlatform
  )
  const [sortField, setSortField] = useState<SortField>(
    initialQueryState.sortField
  )
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    initialQueryState.sortOrder
  )
  const [selectedYears, setSelectedYears] = useState<string[]>(
    initialQueryState.selectedYears
  )
  const [selectedMonths, setSelectedMonths] = useState<string[]>(
    initialQueryState.selectedMonths
  )
  const [page, setPage] = useState(initialQueryState.page)

  useEffect(() => {
    setSelectedType(initialQueryState.selectedType)
    setSelectedLanguage(initialQueryState.selectedLanguage)
    setSelectedPlatform(initialQueryState.selectedPlatform)
    setSortField(initialQueryState.sortField)
    setSortOrder(initialQueryState.sortOrder)
    setSelectedYears(initialQueryState.selectedYears)
    setSelectedMonths(initialQueryState.selectedMonths)
    setPage(initialQueryState.page)
  }, [initialQueryState])

  const navigate = (
    nextState: GalgameQueryState,
    options: { history?: 'push' | 'replace'; scroll?: boolean } = {}
  ) => {
    const queryString = buildGalgameQueryString(nextState)
    const href = queryString ? `/galgame?${queryString}` : '/galgame'
    const { history = 'replace', scroll = false } = options

    startTransition(() => {
      if (history === 'push') {
        router.push(href, { scroll })
        return
      }

      router.replace(href, { scroll })
    })
  }

  const handleSortFieldChange = (value: SortField) => {
    setSortField(value)
    setPage(1)
    navigate({
      ...initialQueryState,
      selectedType,
      selectedLanguage,
      selectedPlatform,
      sortField: value,
      sortOrder,
      selectedYears,
      selectedMonths,
      page: 1
    })
  }

  const handleSortOrderChange = (value: SortOrder) => {
    setSortOrder(value)
    setPage(1)
    navigate({
      ...initialQueryState,
      selectedType,
      selectedLanguage,
      selectedPlatform,
      sortField,
      sortOrder: value,
      selectedYears,
      selectedMonths,
      page: 1
    })
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    setPage(1)
    navigate({
      ...initialQueryState,
      selectedType: value,
      selectedLanguage,
      selectedPlatform,
      sortField,
      sortOrder,
      selectedYears,
      selectedMonths,
      page: 1
    })
  }

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value)
    setPage(1)
    navigate({
      ...initialQueryState,
      selectedType,
      selectedLanguage: value,
      selectedPlatform,
      sortField,
      sortOrder,
      selectedYears,
      selectedMonths,
      page: 1
    })
  }

  const handlePlatformChange = (value: string) => {
    setSelectedPlatform(value)
    setPage(1)
    navigate({
      ...initialQueryState,
      selectedType,
      selectedLanguage,
      selectedPlatform: value,
      sortField,
      sortOrder,
      selectedYears,
      selectedMonths,
      page: 1
    })
  }

  const handleYearsChange = (value: string[]) => {
    const normalizedYears =
      value.includes('all') || value.length === 0 ? ['all'] : value
    const normalizedMonths =
      normalizedYears.includes('all') && !selectedMonths.includes('all')
        ? ['all']
        : selectedMonths

    setSelectedYears(normalizedYears)
    if (normalizedMonths !== selectedMonths) {
      setSelectedMonths(normalizedMonths)
    }
    setPage(1)
    navigate({
      ...initialQueryState,
      selectedType,
      selectedLanguage,
      selectedPlatform,
      sortField,
      sortOrder,
      selectedYears: normalizedYears,
      selectedMonths: normalizedMonths,
      page: 1
    })
  }

  const handleMonthsChange = (value: string[]) => {
    const normalizedMonths =
      value.includes('all') || value.length === 0 ? ['all'] : value

    setSelectedMonths(normalizedMonths)
    setPage(1)
    navigate({
      ...initialQueryState,
      selectedType,
      selectedLanguage,
      selectedPlatform,
      sortField,
      sortOrder,
      selectedYears,
      selectedMonths: normalizedMonths,
      page: 1
    })
  }

  const handlePageChange = (value: number) => {
    setPage(value)
    navigate(
      {
        ...initialQueryState,
        selectedType,
        selectedLanguage,
        selectedPlatform,
        sortField,
        sortOrder,
        selectedYears,
        selectedMonths,
        page: value
      },
      { history: 'push', scroll: true }
    )
  }

  return (
    <div className="container mx-auto my-4 space-y-6" aria-busy={isPending}>
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

      <div
        className={`grid grid-cols-2 gap-4 transition-opacity sm:gap-5 md:grid-cols-4 xl:grid-cols-6 ${isPending ? 'opacity-60' : 'opacity-100'}`}
      >
        {initialGalgames.map((pa) => (
          <GalgameCard key={pa.id} patch={pa} />
        ))}
      </div>

      {initialTotal > 24 && (
        <div className="flex justify-center">
          <KunPagination
            total={Math.ceil(initialTotal / 24)}
            page={page}
            onPageChange={handlePageChange}
            isLoading={isPending}
          />
        </div>
      )}
    </div>
  )
}
