import { CardContainer } from '~/components/galgame/Container'
import { parseGalgameQueryState } from '~/components/galgame/query'
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
  const queryState = parseGalgameQueryState(await searchParams)

  const response = await kunGetActions({
    selectedType: queryState.selectedType,
    selectedLanguage: queryState.selectedLanguage,
    selectedPlatform: queryState.selectedPlatform,
    sortField: queryState.sortField,
    sortOrder: queryState.sortOrder,
    page: queryState.page,
    limit: queryState.limit,
    yearString: JSON.stringify(queryState.selectedYears),
    monthString: JSON.stringify(queryState.selectedMonths)
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <CardContainer
        initialGalgames={response.galgames}
        initialTotal={response.total}
        initialQueryState={queryState}
      />
    </Suspense>
  )
}
