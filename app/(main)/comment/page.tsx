import { CardContainer } from '~/components/comment/Container'
import { parseCommentQueryState } from '~/components/comment/query'
import { kunMetadata } from './metadata'
import { Suspense } from 'react'
import { kunGetActions } from './actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import type { Metadata } from 'next'
import type { SearchParamsRecord } from '~/utils/search-params'

export const revalidate = 3

export const metadata: Metadata = kunMetadata

interface Props {
  searchParams?: Promise<SearchParamsRecord>
}

export default async function Kun({ searchParams }: Props) {
  const payload = await verifyHeaderCookie()
  const queryState = parseCommentQueryState(await searchParams)

  const response = payload
    ? await kunGetActions({
        sortField: queryState.sortField,
        sortOrder: queryState.sortOrder,
        page: queryState.page,
        limit: queryState.limit
      })
    : { comments: [], total: 0 }
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <CardContainer
        initialComments={response.comments}
        initialTotal={response.total}
        uid={payload?.uid}
        initialQueryState={queryState}
      />
    </Suspense>
  )
}
