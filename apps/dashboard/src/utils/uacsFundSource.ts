/**
 * Unified Accounts Code Structure (UACS) Fund Source Utilities
 * 
 * Segment Breakdown of an 8-digit UACS Fund Source Code:
 * - Digits 1-2: Fund Cluster (e.g., 01 Regular Agency Fund, 03 Special Account)
 * - Digit 3: Financing Source (e.g., 1 General Fund, 2 Off-Budgetary)
 * - Digits 4-5: Authorization (e.g., 01 New General, 02 Continuing, 03 Supplemental, 05 Unprogrammed)
 * - Digits 6-8: Fund Category / Specific Fund (e.g., 101 Specific Budgets of NGAs, 422 SAGIP)
 */

export const UACS_FUND_CLUSTERS: Record<string, string> = {
  '01': 'Regular Agency Fund',
  '02': 'Foreign Assisted Projects Fund',
  '03': 'Special Account - Locally Funded/Domestic Grants',
  '04': 'Special Account - Foreign Assisted/Foreign Grants',
  '05': 'Internally Generated Funds',
  '06': 'Business Related Funds',
  '07': 'Trust Receipts',
}

export const UACS_FINANCING_SOURCES: Record<string, string> = {
  '1': 'General Fund',
  '2': 'Off-Budgetary Funds',
  '3': 'Custodial Funds',
}

export const UACS_AUTHORIZATIONS: Record<string, string> = {
  '01': 'New General Appropriations',
  '02': 'Continuing Appropriations',
  '03': 'Supplemental Appropriations',
  '04': 'Automatic Appropriations',
  '05': 'Unprogrammed Appropriations',
  '06': 'Retained Income/Funds',
  '07': 'Revolving Funds',
  '08': 'Trust Receipts',
}

export interface UACSBadgeStyle {
  label: string
  shortLabel: string
  bg: string
  text: string
  border: string
}

export const UACS_AUTHORIZATION_BADGES: Record<string, UACSBadgeStyle> = {
  '01': {
    label: 'New General Appropriations',
    shortLabel: 'New General',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  '02': {
    label: 'Continuing Appropriations',
    shortLabel: 'Continuing',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  '03': {
    label: 'Supplemental Appropriations',
    shortLabel: 'Supplemental',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  '04': {
    label: 'Automatic Appropriations',
    shortLabel: 'Automatic',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  '05': {
    label: 'Unprogrammed Appropriations',
    shortLabel: 'Unprogrammed',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  '06': {
    label: 'Retained Income/Funds',
    shortLabel: 'Retained Income',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
  '07': {
    label: 'Revolving Funds',
    shortLabel: 'Revolving',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
  },
  '08': {
    label: 'Trust Receipts',
    shortLabel: 'Trust Receipts',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
}

export interface ParsedUACSFundSource {
  rawCode: string
  code: string
  name: string
  clusterCode: string
  clusterName: string
  financingCode: string
  financingName: string
  authorizationCode: string
  authorizationName: string
  subCategoryCode: string
  badge: UACSBadgeStyle
  searchString: string
  formattedLabel: string
  formattedShort: string
}

/**
 * Parses an 8-digit UACS Fund Source code and returns structured metadata.
 */
export function parseUACSFundSource(
  code: string = '',
  name: string = '',
): ParsedUACSFundSource {
  const cleanCode = (code || '').trim()
  const cleanName = (name || '').trim()

  // Standardize digits
  const digitsOnly = cleanCode.replace(/[^\d]/g, '')

  let clusterCode = ''
  let clusterName = ''
  let financingCode = ''
  let financingName = ''
  let authorizationCode = ''
  let authorizationName = ''
  let subCategoryCode = ''

  if (digitsOnly.length >= 2) {
    clusterCode = digitsOnly.substring(0, 2)
    clusterName = UACS_FUND_CLUSTERS[clusterCode] || `Cluster ${clusterCode}`
  }

  if (digitsOnly.length >= 3) {
    financingCode = digitsOnly.substring(2, 3)
    financingName = UACS_FINANCING_SOURCES[financingCode] || `Financing ${financingCode}`
  }

  if (digitsOnly.length >= 5) {
    authorizationCode = digitsOnly.substring(3, 5)
    authorizationName =
      UACS_AUTHORIZATIONS[authorizationCode] || `Auth ${authorizationCode}`
  }

  if (digitsOnly.length >= 8) {
    subCategoryCode = digitsOnly.substring(5, 8)
  }

  const badge: UACSBadgeStyle =
    UACS_AUTHORIZATION_BADGES[authorizationCode] || {
      label: authorizationName || 'Standard',
      shortLabel: authorizationName || 'Standard',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
    }

  const displayName = cleanName || `Fund Source ${cleanCode}`
  
  // Example: "01102101 - Specific Budgets of National Government Agencies (Continuing Appropriations)"
  const authSuffix = authorizationName ? ` (${authorizationName})` : ''
  const formattedLabel = cleanCode ? `${cleanCode} - ${displayName}${authSuffix}` : displayName
  const formattedShort = cleanCode ? `[${cleanCode}] ${displayName}` : displayName

  // Build aliases and acronyms for better searchability
  const aliases: string[] = []
  if (financingName.toLowerCase().includes('general fund') || financingCode === '1') {
    aliases.push('gf')
  }
  if (authorizationCode === '01') {
    aliases.push('nga', 'gaa', 'general appropriations act', 'new general')
  } else if (authorizationCode === '02') {
    aliases.push('ca', 'continuing')
  } else if (authorizationCode === '03') {
    aliases.push('sa', 'supplemental')
  } else if (authorizationCode === '04') {
    aliases.push('aa', 'automatic')
  }

  const codeWithoutLeadingZeroes = digitsOnly.replace(/^0+/, '')

  // Search string combining all potential search terms
  const searchString = [
    cleanCode,
    digitsOnly,
    codeWithoutLeadingZeroes && codeWithoutLeadingZeroes !== digitsOnly ? codeWithoutLeadingZeroes : '',
    subCategoryCode,
    displayName,
    authorizationName,
    badge.shortLabel,
    clusterName,
    financingName,
    ...aliases,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return {
    rawCode: cleanCode,
    code: cleanCode,
    name: displayName,
    clusterCode,
    clusterName,
    financingCode,
    financingName,
    authorizationCode,
    authorizationName,
    subCategoryCode,
    badge,
    searchString,
    formattedLabel,
    formattedShort,
  }
}

/**
 * Returns authorization name from authorization code (e.g. '01' -> 'New General Appropriations')
 */
export function getUACSAuthorizationName(code: string): string {
  return UACS_AUTHORIZATIONS[code] || `Authorization ${code}`
}

/**
 * Returns badge styling for an authorization code
 */
export function getUACSBadge(code: string): UACSBadgeStyle {
  return (
    UACS_AUTHORIZATION_BADGES[code] || {
      label: getUACSAuthorizationName(code),
      shortLabel: getUACSAuthorizationName(code),
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
    }
  )
}
