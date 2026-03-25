import { TopicListPage } from '~/components/topic/TopicListPage'
import { parseTopicQueryState } from '~/components/topic/query'
import type { Metadata } from 'next'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { kunGetTopicListActions } from './actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import type { SearchParamsRecord } from '~/utils/search-params'

export const metadata: Metadata = {
  title: `话题列表 - ${kunMoyuMoe.title}`,
  description: '浏览所有话题讨论'
}

interface Props {
  searchParams?: Promise<SearchParamsRecord>
}

export default async function TopicPage({ searchParams }: Props) {
  const queryState = parseTopicQueryState(await searchParams)
  const response = await kunGetTopicListActions({
    sortField: queryState.sortField,
    sortOrder: queryState.sortOrder,
    page: queryState.page,
    limit: queryState.limit
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <TopicListPage
      initialTopics={response.topics}
      initialTotal={response.total}
      initialQueryState={queryState}
    />
  )
}
