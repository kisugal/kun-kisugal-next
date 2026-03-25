import {
  readPositiveInt,
  readSearchParam,
  type SearchParamsRecord
} from '~/utils/search-params'

export interface TagQueryState {
  page: number
  limit: number
}

export const defaultTagQueryState: TagQueryState = {
  page: 1,
  limit: 100
}

export const parseTagQueryState = (
  searchParams?: SearchParamsRecord
): TagQueryState => ({
  page: readPositiveInt(
    readSearchParam(searchParams, 'page'),
    defaultTagQueryState.page
  ),
  limit: defaultTagQueryState.limit
})

export const buildTagQueryString = (state: TagQueryState) => {
  const params = new URLSearchParams()

  if (state.page !== defaultTagQueryState.page) {
    params.set('page', state.page.toString())
  }

  return params.toString()
}
