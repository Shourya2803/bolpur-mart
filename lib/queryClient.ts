import { QueryClient } from "@tanstack/react-query"

// Enhanced API request function
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  options: RequestInit = {}
): Promise<Response> {
  // Ensure URL starts with /api for consistency
  const fullUrl = url.startsWith("/api") ? url : `/api${url.startsWith("/") ? "" : "/"}${url}`

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  }

  // Add body for POST/PUT/PATCH requests
  if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    config.body = JSON.stringify(data)
  }

  const response = await fetch(fullUrl, config)

  if (!response.ok) {
    let errorMessage = `${response.status}: ${response.statusText}`

    try {
      const errorText = await response.text()
      if (errorText) {
        // Try to parse JSON error response
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // If not JSON, use the text as is
          errorMessage = errorText
        }
      }
    } catch {
      // If reading response fails, stick with status message
    }

    const error = new Error(errorMessage)
      ; (error as any).status = response.status
    throw error
  }

  return response
}

// Create query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on authentication/authorization errors
        const status = error?.status || 0
        if (status === 401 || status === 403) {
          return false
        }
        // Don't retry on client errors (4xx)
        if (status >= 400 && status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        const status = error?.status || 0
        if (status >= 400 && status < 500) {
          return false
        }
        return failureCount < 1
      },
    },
  },
})

// Utility functions for type-safe API calls
export async function apiGet<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await apiRequest("GET", url, undefined, options)
  return response.json() as Promise<T>
}

export async function apiPost<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
  const response = await apiRequest("POST", url, data, options)
  return response.json() as Promise<T>
}

export async function apiPut<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
  const response = await apiRequest("PUT", url, data, options)
  return response.json() as Promise<T>
}

export async function apiPatch<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
  const response = await apiRequest("PATCH", url, data, options)
  return response.json() as Promise<T>
}

export async function apiDelete<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await apiRequest("DELETE", url, undefined, options)
  return response.json() as Promise<T>
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

export function isApiError(error: unknown): error is Error & { status: number } {
  return error instanceof Error && 'status' in error
}

// Export default for compatibility
export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  queryClient,
  getErrorMessage,
  isApiError
}
