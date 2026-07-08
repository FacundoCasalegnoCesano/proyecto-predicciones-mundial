const API_BASE_URL = '/api'

const getToken = () => localStorage.getItem('token') || ''

/**
 * Centralized request handler that manages authentication,
 * headers and basic error handling.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }


  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred'
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
    } catch {
      // Response was not JSON
    }
    throw new Error(errorMessage)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}
