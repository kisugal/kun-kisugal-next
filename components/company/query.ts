import {
  readPositiveInt,
  readSearchParam,
  type SearchParamsRecord
} from '~/utils/search-params'

export interface CompanyQueryState {
  page: number
  limit: number
}

export const defaultCompanyQueryState: CompanyQueryState = {
  page: 1,
  limit: 100
}

export const parseCompanyQueryState = (
  searchParams?: SearchParamsRecord
): CompanyQueryState => ({
  page: readPositiveInt(
    readSearchParam(searchParams, 'page'),
    defaultCompanyQueryState.page
  ),
  limit: defaultCompanyQueryState.limit
})

export const buildCompanyQueryString = (state: CompanyQueryState) => {
  const params = new URLSearchParams()

  if (state.page !== defaultCompanyQueryState.page) {
    params.set('page', state.page.toString())
  }

  return params.toString()
}
