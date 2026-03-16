import type { SortField, SortOrder } from './_sort'
import {
  readPositiveInt,
  readSearchParam,
  type SearchParamsRecord
} from '~/utils/search-params'

export interface GalgameQueryState {
  selectedType: string
  selectedLanguage: string
  selectedPlatform: string
  sortField: SortField
  sortOrder: SortOrder
  selectedYears: string[]
  selectedMonths: string[]
  page: number
  limit: number
}

export const defaultGalgameQueryState: GalgameQueryState = {
  selectedType: 'all',
  selectedLanguage: 'all',
  selectedPlatform: 'all',
  sortField: 'resource_update_time',
  sortOrder: 'desc',
  selectedYears: ['all'],
  selectedMonths: ['all'],
  page: 1,
  limit: 24
}

const galgameSortFields = new Set<SortField>([
  'resource_update_time',
  'created',
  'view',
  'download',
  'favorite'
])

const galgameSortOrders = new Set<SortOrder>(['asc', 'desc'])

const normalizeSelection = (value: string[] | undefined) => {
  if (!value || value.length === 0 || value.includes('all')) {
    return ['all']
  }

  return value
}

const parseSelection = (value: string | undefined) => {
  if (!value) {
    return ['all']
  }

  try {
    const parsed = JSON.parse(value)
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === 'string')
    ) {
      return normalizeSelection(parsed)
    }
  } catch {
    return ['all']
  }

  return ['all']
}

export const parseGalgameQueryState = (
  searchParams?: SearchParamsRecord
): GalgameQueryState => {
  const sortFieldValue = readSearchParam(searchParams, 'sortField')
  const sortOrderValue = readSearchParam(searchParams, 'sortOrder')

  return {
    selectedType:
      readSearchParam(searchParams, 'selectedType') ??
      defaultGalgameQueryState.selectedType,
    selectedLanguage:
      readSearchParam(searchParams, 'selectedLanguage') ??
      defaultGalgameQueryState.selectedLanguage,
    selectedPlatform:
      readSearchParam(searchParams, 'selectedPlatform') ??
      defaultGalgameQueryState.selectedPlatform,
    sortField: galgameSortFields.has(sortFieldValue as SortField)
      ? (sortFieldValue as SortField)
      : defaultGalgameQueryState.sortField,
    sortOrder: galgameSortOrders.has(sortOrderValue as SortOrder)
      ? (sortOrderValue as SortOrder)
      : defaultGalgameQueryState.sortOrder,
    selectedYears: parseSelection(readSearchParam(searchParams, 'yearString')),
    selectedMonths: parseSelection(
      readSearchParam(searchParams, 'monthString')
    ),
    page: readPositiveInt(
      readSearchParam(searchParams, 'page'),
      defaultGalgameQueryState.page
    ),
    limit: defaultGalgameQueryState.limit
  }
}

export const buildGalgameQueryString = (state: GalgameQueryState) => {
  const params = new URLSearchParams()

  if (state.selectedType !== defaultGalgameQueryState.selectedType) {
    params.set('selectedType', state.selectedType)
  }
  if (state.selectedLanguage !== defaultGalgameQueryState.selectedLanguage) {
    params.set('selectedLanguage', state.selectedLanguage)
  }
  if (state.selectedPlatform !== defaultGalgameQueryState.selectedPlatform) {
    params.set('selectedPlatform', state.selectedPlatform)
  }
  if (state.sortField !== defaultGalgameQueryState.sortField) {
    params.set('sortField', state.sortField)
  }
  if (state.sortOrder !== defaultGalgameQueryState.sortOrder) {
    params.set('sortOrder', state.sortOrder)
  }
  if (state.page !== defaultGalgameQueryState.page) {
    params.set('page', state.page.toString())
  }
  if (!state.selectedYears.includes('all')) {
    params.set('yearString', JSON.stringify(state.selectedYears))
  }
  if (!state.selectedMonths.includes('all')) {
    params.set('monthString', JSON.stringify(state.selectedMonths))
  }

  return params.toString()
}
