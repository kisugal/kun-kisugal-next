type FetchOptions = {
  headers?: Record<string, string>
  query?: Record<string, string | number>
  body?: Record<string, unknown>
  formData?: FormData
}

export class KunFetchError extends Error {
  status: number
  responseBody: unknown

  constructor(status: number, responseBody?: unknown) {
    super(`Kun Fetch error! Status: ${status}`)
    this.name = 'KunFetchError'
    this.status = status
    this.responseBody = responseBody ?? null
  }
}

export const getKunFetchErrorMessage = (error: unknown) => {
  if (!(error instanceof KunFetchError)) {
    return null
  }

  if (typeof error.responseBody === 'string') {
    return error.responseBody
  }

  if (
    error.responseBody &&
    typeof error.responseBody === 'object' &&
    'error' in error.responseBody &&
    typeof error.responseBody.error === 'string'
  ) {
    return error.responseBody.error
  }

  return `请求失败 (${error.status})`
}

const kunFetchRequest = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  options?: FetchOptions
): Promise<T> => {
  const { headers = {}, query, body, formData } = options || {}

  const queryString = query
    ? '?' +
      Object.entries(query)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        )
        .join('&')
    : ''

  const fetchAddress =
    process.env.NODE_ENV === 'development'
      ? '' // 开发环境使用相对路径
      : process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD
  const fullUrl = `${fetchAddress}${url}${queryString}`

  const fetchOptions: RequestInit = {
    method,
    credentials: 'include',
    mode: 'cors',
    headers: {
      ...headers
    }
  }

  if (formData) {
    fetchOptions.body = formData
  } else if (body) {
    fetchOptions.headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers
    }
    fetchOptions.body = JSON.stringify(body)
  }

  const response = await fetch(fullUrl, fetchOptions)

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    const responseBody = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null)

    throw new KunFetchError(response.status, responseBody)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const res = await response.json()

  return res
}

export const kunFetchGet = async <T>(
  url: string,
  query?: Record<string, string | number>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'GET', { query })
}

export const kunFetchPost = async <T>(
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'POST', { body })
}

export const kunFetchPut = async <T>(
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'PUT', { body })
}

export const kunFetchPatch = async <T>(
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'PATCH', { body })
}

export const kunFetchDelete = async <T>(
  url: string,
  query?: Record<string, string | number>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'DELETE', { query })
}

export const kunFetchFormData = async <T>(
  url: string,
  formData?: FormData
): Promise<T> => {
  if (!formData) {
    throw new Error('formData is required for kunFetchFormData')
  }
  return kunFetchRequest<T>(url, 'POST', { formData })
}
