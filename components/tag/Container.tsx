'use client'

import { useEffect, useState, useTransition } from 'react'
import { useDebounce } from 'use-debounce'
import { TagHeader } from './TagHeader'
import { SearchTags } from './SearchTag'
import { TagList } from './TagList'
import { kunFetchPost } from '~/utils/kunFetch'
import { KunPagination } from '~/components/kun/Pagination'
import { KunNull } from '~/components/kun/Null'
import type { Tag as TagType } from '~/types/api/tag'
import { useRouter } from 'next/navigation'
import { buildTagQueryString, type TagQueryState } from './query'

interface Props {
  initialTags: TagType[]
  initialTotal: number
  uid?: number
  initialQueryState: TagQueryState
}

export const Container = ({
  initialTags,
  initialTotal,
  uid,
  initialQueryState
}: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tags, setTags] = useState<TagType[]>(initialTags)
  const [page, setPage] = useState(initialQueryState.page)
  const [total, setTotal] = useState(initialTotal)

  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 500)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    setTags(initialTags)
    setTotal(initialTotal)
    setPage(initialQueryState.page)
  }, [initialTags, initialTotal, initialQueryState])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearching(false)
      setTags(initialTags)
      return
    }

    handleSearch(debouncedQuery)
  }, [debouncedQuery, initialTags])

  const handleSearch = async (value: string = query) => {
    if (!value.trim()) {
      return
    }

    setSearching(true)
    const response = await kunFetchPost<TagType[]>('/api/search/tag', {
      query: value.split(' ').filter((term) => term.length > 0)
    })
    setTags(response)
    setSearching(false)
  }

  const handlePageChange = (value: number) => {
    setPage(value)
    const queryString = buildTagQueryString({
      ...initialQueryState,
      page: value
    })
    const href = queryString ? `/tag?${queryString}` : '/tag'

    startTransition(() => {
      router.push(href, { scroll: true })
    })
  }

  return (
    <div className="flex flex-col w-full my-4 space-y-8">
      <TagHeader
        setNewTag={(newTag) => {
          setTags((prev) => [newTag, ...prev])
          setTotal((prev) => prev + 1)
        }}
      />

      {uid ? (
        <>
          <SearchTags
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            searching={searching}
          />

          {!searching && (
            <TagList tags={tags} loading={isPending} searching={searching} />
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
          <KunNull message="请登陆后查看游戏标签" />
        </>
      )}
    </div>
  )
}
