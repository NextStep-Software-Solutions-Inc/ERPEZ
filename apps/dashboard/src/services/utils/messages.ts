import type { AxiosError, AxiosResponse } from 'erpez-shared-lib'
import type { APIResponse, PaginationResponse } from 'erpez-shared-lib'

/**
 * Extracts a user-friendly error message from an unknown error object returned by Axios or other sources.
 */
export const extractErrorMessage = (error: AxiosError): string => {
  if (!error.response?.data || typeof error.response?.data !== 'object') {
    return error.message || 'An error occurred while processing your request.'
  }

  const data = error.response.data as Record<string, unknown>

  let message = ''
  if ('message' in data && typeof data.message === 'string' && data.message) {
    message = data.message
  } else if ('Message' in data && typeof data.Message === 'string' && data.Message) {
    message = data.Message
  } else if ('detail' in data && typeof data.detail === 'string' && data.detail) {
    message = data.detail
  } else if ('title' in data && typeof data.title === 'string' && data.title) {
    message = data.title
  }

  // Handle ASP.NET ValidationErrors or ApiResponse.Errors shape
  if ('errors' in data && data.errors && typeof data.errors === 'object') {
    const errorDetails = Object.entries(data.errors as Record<string, unknown>)
      .filter(([, value]) => Array.isArray(value))
      .flatMap(([key, value]) => (value as unknown[]).map((v) => `${key}: ${v}`))

    if (errorDetails.length > 0) {
      const detailsStr = errorDetails.join('; ')
      message = message ? `${message} (${detailsStr})` : detailsStr
    }
  }

  // Legacy/alternate shape: { error: [{ field: "message" }] }
  if ('error' in data && Array.isArray(data.error)) {
    const errorDetails = (data.error as unknown[])
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .flatMap((item) =>
        Object.entries(item)
          .filter(([, value]) => value && typeof value === 'string')
          .map(([key, value]) => `${key}: ${value}`),
      )

    if (errorDetails.length > 0) {
      const detailsStr = errorDetails.join('; ')
      message = message ? `${message} (${detailsStr})` : detailsStr
    }
  }

  return message || error.message || 'An error occurred while processing your request.'
}

/**
 * Extracts a success message from an Axios response that follows the project's APIResponse/PaginationResponse shapes.
 */
export const extractSuccessMessage = <T>(
  response: AxiosResponse<APIResponse<T> | PaginationResponse<T>>,
): string => {
  return response.data &&
    'succeeded' in response.data &&
    response.data.succeeded &&
    'message' in response.data &&
    typeof response.data.message === 'string'
    ? response.data.message
    : 'Request successful'
}
