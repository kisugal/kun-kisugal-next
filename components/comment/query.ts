import type { SortDirection, SortOption } from './_sort'
import {
  readPositiveInt,
  readSearchParam,
  type SearchParamsRecord
} from '~/utils/search-params'

export interface CommentQueryState {
  sortField: SortOption
  sortOrder: SortDirection
  page: number
  limit: number
}

export const defaultCommentQueryState: CommentQueryState = {
  sortField: 'created',
  sortOrder: 'desc',
  page: 1,
  limit: 50
}

const sortFields = new Set<SortOption>(['created', 'like'])
const sortOrders = new Set<SortDirection>(['asc', 'desc'])

export const parseCommentQueryState = (
  searchParams?: SearchParamsRecord
): CommentQueryState => {
  const sortFieldValue = readSearchParam(searchParams, 'sortField')
  const sortOrderValue = readSearchParam(searchParams, 'sortOrder')

  return {
    sortField: sortFields.has(sortFieldValue as SortOption)
      ? (sortFieldValue as SortOption)
      : defaultCommentQueryState.sortField,
    sortOrder: sortOrders.has(sortOrderValue as SortDirection)
      ? (sortOrderValue as SortDirection)
      : defaultCommentQueryState.sortOrder,
    page: readPositiveInt(
      readSearchParam(searchParams, 'page'),
      defaultCommentQueryState.page
    ),
    limit: defaultCommentQueryState.limit
  }
}

export const buildCommentQueryString = (state: CommentQueryState) => {
  const params = new URLSearchParams()

  if (state.sortField !== defaultCommentQueryState.sortField) {
    params.set('sortField', state.sortField)
  }
  if (state.sortOrder !== defaultCommentQueryState.sortOrder) {
    params.set('sortOrder', state.sortOrder)
  }
  if (state.page !== defaultCommentQueryState.page) {
    params.set('page', state.page.toString())
  }

  return params.toString()
}
