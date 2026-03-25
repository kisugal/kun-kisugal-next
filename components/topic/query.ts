import {
  readPositiveInt,
  readSearchParam,
  type SearchParamsRecord
} from '~/utils/search-params'

export type TopicSortField = 'created' | 'view_count' | 'like_count'
export type TopicSortOrder = 'asc' | 'desc'

export interface TopicQueryState {
  sortField: TopicSortField
  sortOrder: TopicSortOrder
  page: number
  limit: number
}

export const defaultTopicQueryState: TopicQueryState = {
  sortField: 'created',
  sortOrder: 'desc',
  page: 1,
  limit: 10
}

const sortFields = new Set<TopicSortField>([
  'created',
  'view_count',
  'like_count'
])
const sortOrders = new Set<TopicSortOrder>(['asc', 'desc'])

export const parseTopicQueryState = (
  searchParams?: SearchParamsRecord
): TopicQueryState => {
  const sortFieldValue = readSearchParam(searchParams, 'sortField')
  const sortOrderValue = readSearchParam(searchParams, 'sortOrder')

  return {
    sortField: sortFields.has(sortFieldValue as TopicSortField)
      ? (sortFieldValue as TopicSortField)
      : defaultTopicQueryState.sortField,
    sortOrder: sortOrders.has(sortOrderValue as TopicSortOrder)
      ? (sortOrderValue as TopicSortOrder)
      : defaultTopicQueryState.sortOrder,
    page: readPositiveInt(
      readSearchParam(searchParams, 'page'),
      defaultTopicQueryState.page
    ),
    limit: defaultTopicQueryState.limit
  }
}

export const buildTopicQueryString = (state: TopicQueryState) => {
  const params = new URLSearchParams()

  if (state.sortField !== defaultTopicQueryState.sortField) {
    params.set('sortField', state.sortField)
  }
  if (state.sortOrder !== defaultTopicQueryState.sortOrder) {
    params.set('sortOrder', state.sortOrder)
  }
  if (state.page !== defaultTopicQueryState.page) {
    params.set('page', state.page.toString())
  }

  return params.toString()
}
