import { Container } from '~/components/company/Container'
import { parseCompanyQueryState } from '~/components/company/query'
import { kunMetadata } from './metadata'
import { kunGetCompaniesActions } from './actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { Suspense } from 'react'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import type { Metadata } from 'next'
import type { SearchParamsRecord } from '~/utils/search-params'

export const revalidate = 3

export const metadata: Metadata = kunMetadata

interface Props {
    searchParams?: Promise<SearchParamsRecord>
}

export default async function Kun({ searchParams }: Props) {
    const queryState = parseCompanyQueryState(await searchParams)
    const response = await kunGetCompaniesActions({
        page: queryState.page,
        limit: queryState.limit
    })
    if (typeof response === 'string') {
        return <ErrorComponent error={response} />
    }

    const payload = await verifyHeaderCookie()

    return (
        <Suspense>
            <Container
                initialCompanies={response.companies}
                initialTotal={response.total}
                uid={payload?.uid}
                initialQueryState={queryState}
            />
        </Suspense>
    )
}
