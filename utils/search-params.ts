export type SearchParamValue = string | string[] | undefined

export type SearchParamsRecord = Record<string, SearchParamValue> | undefined

export const readSearchParam = (
  searchParams: SearchParamsRecord,
  key: string
) => {
  const value = searchParams?.[key]

  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export const readPositiveInt = (
  value: string | undefined,
  fallback: number
) => {
  const parsed = Number.parseInt(value ?? '', 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}
