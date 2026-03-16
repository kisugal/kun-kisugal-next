import type { SortDirection, SortOption } from './_sort'
import {
  readPositiveInt,
  readSearchParam,
  type SearchParamsRecord
} from '~/utils/search-params'

export interface ResourceQueryState {
  sortField: SortOption
  sortOrder: SortDirection
  page: number
  limit: number
}

export const defaultResourceQueryState: ResourceQueryState = {
  sortField: 'created',
  sortOrder: 'desc',
  page: 1,
  limit: 50
}

const sortFields = new Set<SortOption>(['created', 'download', 'like'])
const sortOrders = new Set<SortDirection>(['asc', 'desc'])

export const parseResourceQueryState = (
  searchParams?: SearchParamsRecord
): ResourceQueryState => {
  const sortFieldValue = readSearchParam(searchParams, 'sortField')
  const sortOrderValue = readSearchParam(searchParams, 'sortOrder')

  return {
    sortField: sortFields.has(sortFieldValue as SortOption)
      ? (sortFieldValue as SortOption)
      : defaultResourceQueryState.sortField,
    sortOrder: sortOrders.has(sortOrderValue as SortDirection)
      ? (sortOrderValue as SortDirection)
      : defaultResourceQueryState.sortOrder,
    page: readPositiveInt(
      readSearchParam(searchParams, 'page'),
      defaultResourceQueryState.page
    ),
    limit: defaultResourceQueryState.limit
  }
}

export const buildResourceQueryString = (state: ResourceQueryState) => {
  const params = new URLSearchParams()

  if (state.sortField !== defaultResourceQueryState.sortField) {
    params.set('sortField', state.sortField)
  }
  if (state.sortOrder !== defaultResourceQueryState.sortOrder) {
    params.set('sortOrder', state.sortOrder)
  }
  if (state.page !== defaultResourceQueryState.page) {
    params.set('page', state.page.toString())
  }

  return params.toString()
}
