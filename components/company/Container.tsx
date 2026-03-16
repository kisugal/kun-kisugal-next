'use client'

import { useEffect, useState, useTransition } from 'react'
import { useDebounce } from 'use-debounce'
import { CompanyHeader } from './CompanyHeader'
import { SearchCompany } from './SearchCompany'
import { CompanyList } from './CompanyList'
import { kunFetchPost } from '~/utils/kunFetch'
import { KunPagination } from '~/components/kun/Pagination'
import { KunNull } from '~/components/kun/Null'
import type { Company } from '~/types/api/company'
import { useRouter } from 'next/navigation'
import { buildCompanyQueryString, type CompanyQueryState } from './query'

interface Props {
  initialCompanies: Company[]
  initialTotal: number
  uid?: number
  initialQueryState: CompanyQueryState
}

export const Container = ({
  initialCompanies,
  initialTotal,
  uid,
  initialQueryState
}: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [page, setPage] = useState(initialQueryState.page)
  const [total, setTotal] = useState(initialTotal)

  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 500)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    setCompanies(initialCompanies)
    setTotal(initialTotal)
    setPage(initialQueryState.page)
  }, [initialCompanies, initialTotal, initialQueryState])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearching(false)
      setCompanies(initialCompanies)
      return
    }

    handleSearch(debouncedQuery)
  }, [debouncedQuery, initialCompanies])

  const handleSearch = async (value: string = query) => {
    if (!value.trim()) {
      return
    }

    setSearching(true)
    const response = await kunFetchPost<Company[]>('/api/search/company', {
      query: value.split(' ').filter((term) => term.length > 0)
    })
    setCompanies(response)
    setSearching(false)
  }

  const handlePageChange = (value: number) => {
    setPage(value)
    const queryString = buildCompanyQueryString({
      ...initialQueryState,
      page: value
    })
    const href = queryString ? `/companies?${queryString}` : '/companies'

    startTransition(() => {
      router.push(href, { scroll: true })
    })
  }

  return (
    <div className="flex flex-col w-full my-4 space-y-8">
      <CompanyHeader />

      {uid ? (
        <>
          <SearchCompany
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            searching={searching}
          />

          {!searching && (
            <CompanyList
              companies={companies}
              loading={isPending}
              searching={searching}
            />
          )}

          {total > 100 && !query && (
            <div className="flex justify-center">
              <KunPagination
                total={Math.ceil(total / 100)}
                page={page}
                onPageChange={handlePageChange}
                isLoading={isPending}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <KunNull message="请登陆后查看会社列表" />
        </>
      )}
    </div>
  )
}
