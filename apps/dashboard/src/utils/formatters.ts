// --- Currency Conversion ---

/**
 * Abbreviated PHP currency formatter for dashboard displays.
 * Examples: ₱1.5B, ₱48.8M, ₱120K, ₱500
 */
export function formatCurrencyAbbr(amount: number): string {
  // Handle negatives consistently
  if (amount < 0) return `-${formatCurrencyAbbr(Math.abs(amount))}`

  if (amount >= 1_000_000_000) return `₱${(amount / 1_000_000_000).toFixed(2)}B`
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(0)}K`
  return `₱${amount.toLocaleString('en-PH')}`
}

export const formatCurrencyPHP = (
  amount: number | null | undefined,
): string => {
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value)
}
export function truncateText(
  text: string | undefined,
  maxLength: number,
): string {
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}..` : text
}

// --- Title Case Conversion ---
export const toTitleCase = (str: string | null | undefined): string => {
  if (!str) {
    return ''
  }
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (word.length === 0) {
        return ''
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export const toSentenceCase = (str: string | null | undefined): string => {
  if (!str) {
    return ''
  }

  const s = String(str)
  const lower = s.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/**
 * Converts PascalCase or camelCase to Title Case with spaces
 * @example pascalCaseToWords("InitialProposal") => "Initial Proposal"
 * @example pascalCaseToWords("budgetCall") => "Budget Call"
 */
export const pascalCaseToWords = (str: string | null | undefined): string => {
  if (!str) {
    return ''
  }

  return (
    String(str)
      // Insert space before uppercase letters followed by lowercase letters
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      // Insert space before uppercase letters preceded by lowercase letters or numbers
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      // Capitalize first letter of each word
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  )
}

// --- Date Formatting (Example for Display) ---
export const formatDisplayDate = (
  dateString: string | null | undefined,
): string => {
  if (!dateString) {
    return '-'
  }
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } catch (e) {
    return 'Invalid Date'
  }
}

// --- Date Formatting (Example for HTML Input 'max' attribute) ---
export const getTodayDateString = (): string => {
  const today = new Date()
  return today.toISOString().slice(0, 10)
}

// --- Date Formatting (MM-dd-yyyy) ---
export const formatDate = (
  dateString: string | null | undefined,
  format: string = 'MM-dd-yyyy',
): string => {
  if (!dateString) {
    return '-'
  }
  try {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()

    if (format === 'MM-dd-yyyy') {
      return `${month}-${day}-${year}`
    }
    return dateString
  } catch (e) {
    return 'Invalid Date'
  }
}

// --- Relative Date Formatting (e.g., "2 hours ago") ---
export const formatRelativeDate = (
  dateString: string | null | undefined,
): string => {
  if (!dateString) {
    return '-'
  }
  try {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) {
      return 'just now'
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    }

    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    }

    const days = Math.floor(hours / 24)
    if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`
    }

    const weeks = Math.floor(days / 7)
    if (weeks < 4) {
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
    }

    const months = Math.floor(days / 30)
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''} ago`
    }

    const years = Math.floor(months / 12)
    return `${years} year${years !== 1 ? 's' : ''} ago`
  } catch (e) {
    return 'Invalid Date'
  }
}

// --- Funding Source Type Formatting ---
/**
 * Format funding source type for display
 * Converts backend format (e.g., "FinancingSource") to display format (e.g., "Financing Source")
 */
export function formatFundSourceType(type: string | undefined): string {
  if (!type) return ''

  // Map of backend values (without spaces) to display values (with spaces)
  const typeDisplayMap: Record<string, string> = {
    FundCluster: 'Fund Cluster',
    FinancingSource: 'Financing Source',
    AuthorizationCode: 'Authorization Code',
    FundCategory: 'Fund Category',
    FundSubCategory: 'Fund Sub Category',
    // Also support already-spaced values
    'Fund Cluster': 'Fund Cluster',
    'Financing Source': 'Financing Source',
    'Authorization Code': 'Authorization Code',
    'Fund Category': 'Fund Category',
    'Fund Sub Category': 'Fund Sub Category',
  }

  return typeDisplayMap[type] || type
}

/**
 * Convert display format (with spaces) to backend format (without spaces)
 * Used when sending data to API
 */
export function formatFundSourceTypeForBackend(
  type: string | undefined,
): string {
  if (!type) return ''

  // Map of display values (with spaces) to backend values (without spaces)
  const typeBackendMap: Record<string, string> = {
    'Fund Cluster': 'FundCluster',
    'Financing Source': 'FinancingSource',
    'Authorization Code': 'AuthorizationCode',
    'Fund Category': 'FundCategory',
    'Fund Sub Category': 'FundSubCategory',
    // Also support backend format already
    FundCluster: 'FundCluster',
    FinancingSource: 'FinancingSource',
    AuthorizationCode: 'AuthorizationCode',
    FundCategory: 'FundCategory',
    FundSubCategory: 'FundSubCategory',
  }

  return typeBackendMap[type] || type
}

export const formatDateV2 = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(value)
  if (isNaN(date.getTime()) || date.getFullYear() <= 1970) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

export const getStatusLabel = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'DRAFT':
      return 'Draft'
    case 'SUBMITTED':
      return 'For PMT Review'
    case 'APPROVED':
      return 'Approved'
    default:
      return status || 'Unknown'
  }
}
