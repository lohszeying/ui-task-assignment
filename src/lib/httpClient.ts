type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined>
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
}

export type HttpResponse = {
  data: unknown
  status: number
}

export type HttpError = Error & {
  status: number
  payload?: unknown
}

const buildUrl = (path: string, baseUrl: string, params?: RequestOptions['params']) => {
  const url = new URL(path, baseUrl)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

const parseJson = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return undefined
  }

  try {
    return await response.json()
  } catch (error) {
    console.warn('Failed to parse JSON response', error)
    return undefined
  }
}

const request = async (
  method: HttpMethod,
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
) => {
  const { params, body, headers, signal } = options

  const response = await fetch(buildUrl(path, baseUrl, params), {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  const data = await parseJson(response)

  if (!response.ok) {
    const error = new Error(`${response.status} ${response.statusText}`) as HttpError
    error.status = response.status
    if (data !== undefined) {
      error.payload = data
    }
    throw error
  }

  return {
    data,
    status: response.status,
  } as HttpResponse
}

export const httpClient = {
  get: (baseUrl: string, path: string,  options?: RequestOptions) =>
    request('GET', baseUrl, path, options),
  post: (baseUrl: string, path: string, options?: RequestOptions) =>
    request('POST', baseUrl, path, options),
  put: (baseUrl: string, path: string, options?: RequestOptions) =>
    request('PUT', baseUrl, path, options),
  patch: (baseUrl: string, path: string, options?: RequestOptions) => 
    request('PATCH', baseUrl, path, options),
  delete: (baseUrl: string, path: string, options?: RequestOptions) =>
    request('DELETE', baseUrl, path, options),
}
