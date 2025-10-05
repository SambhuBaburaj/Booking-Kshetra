/**
 * Extracts user-friendly error messages from API errors
 * @param err - The error object from API calls
 * @returns A user-friendly error message
 */
export const extractErrorMessage = (err: any): string => {
  // Check if backend returned a specific error message
  if (err.response?.data?.message) {
    return err.response.data.message
  }

  // Handle specific HTTP status codes
  switch (err.response?.status) {
    case 400:
      return 'Invalid data provided. Please check your inputs.'
    case 401:
      return 'Authentication failed. Please login again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 409:
      return 'A conflict occurred. The resource already exists.'
    case 422:
      return 'Validation failed. Please check your inputs.'
    case 429:
      return 'Too many requests. Please try again later.'
    case 500:
      return 'Server error. Please try again later.'
    case 502:
      return 'Service temporarily unavailable. Please try again later.'
    case 503:
      return 'Service unavailable. Please try again later.'
    default:
      break
  }

  // Check for network errors
  if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
    return 'Network error. Please check your connection and try again.'
  }

  // Check for timeout errors
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }

  // Use the error message if it's not a generic axios message
  if (err.message && !err.message.includes('status code') && !err.message.includes('Request failed')) {
    return err.message
  }

  // Fallback message
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Specific error handler for coupon operations
 * @param err - The error object from coupon API calls
 * @returns A user-friendly error message specific to coupon operations
 */
export const extractCouponErrorMessage = (err: any): string => {
  // Check for coupon-specific errors first
  if (err.response?.data?.message) {
    const message = err.response.data.message.toLowerCase()

    if (message.includes('coupon code already exists')) {
      return 'This coupon code already exists. Please use a different code.'
    }

    if (message.includes('coupon not found')) {
      return 'Coupon not found. It may have been deleted.'
    }

    if (message.includes('coupon has been used')) {
      return 'Cannot delete coupon that has been used. Please deactivate it instead.'
    }

    if (message.includes('coupon is not active')) {
      return 'This coupon is not active.'
    }

    if (message.includes('coupon has expired')) {
      return 'This coupon has expired.'
    }

    if (message.includes('invalid coupon')) {
      return 'Invalid coupon code.'
    }
  }

  // Fall back to general error handling
  return extractErrorMessage(err)
}