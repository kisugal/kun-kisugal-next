import { CardContainer } from '~/components/resource/Container'
import { parseResourceQueryState } from '~/components/resource/query'
import { kunMetadata } from './metadata'
import { Suspense } from 'react'
import { kunGetActions } from './actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import type { Metadata } from 'next'
import type { SearchParamsRecord } from '~/utils/search-params'

export const revalidate = 3

export const metadata: Metadata = kunMetadata

interface Props {
  searchParams?: Promise<SearchParamsRecord>
}

export default async function Kun({ searchParams }: Props) {
  const queryState = parseResourceQueryState(await searchParams)

  const response = await kunGetActions({
    sortField: queryState.sortField,
    sortOrder: queryState.sortOrder,
    page: queryState.page,
    limit: queryState.limit
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <CardContainer
        initialResources={response.resources}
        initialTotal={response.total}
        initialQueryState={queryState}
      />
    </Suspense>
  )
}
