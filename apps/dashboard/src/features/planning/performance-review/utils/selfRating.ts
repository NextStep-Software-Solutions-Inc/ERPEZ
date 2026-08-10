import type { KeycloakTokenParsed } from 'keycloak-js'

import type {
  KPICategory,
  KPILineItem,
  OPCRReference,
  MOVFile,
} from '../types'

export const SELF_RATING_CATEGORIES: KPICategory[] = [
  'STRATEGIC',
  'CORE',
  'SUPPORT',
]

export const CATEGORY_COLORS: Record<KPICategory, string> = {
  STRATEGIC: 'text-violet-700 bg-violet-50 border-violet-200',
  CORE: 'text-blue-700 bg-blue-50 border-blue-200',
  SUPPORT: 'text-emerald-700 bg-emerald-50 border-emerald-200',
}

export const CATEGORY_DOT: Record<KPICategory, string> = {
  STRATEGIC: 'bg-violet-500',
  CORE: 'bg-blue-500',
  SUPPORT: 'bg-emerald-500',
}

export const KPI_LEFT_BORDER: Record<KPICategory, string> = {
  STRATEGIC: 'border-l-violet-500',
  CORE: 'border-l-blue-500',
  SUPPORT: 'border-l-emerald-500',
}

export const TARGET_FIELDS: Array<{
  key: keyof NonNullable<KPILineItem['targetInfo']>
  label: string
}> = [
  { key: 'assignedTargetAnnual', label: 'Assigned Annual' },
  { key: 'assignedTargetQ1', label: 'Assigned Q1' },
  { key: 'assignedTargetQ2', label: 'Assigned Q2' },
  { key: 'assignedTargetQ3', label: 'Assigned Q3' },
  { key: 'assignedTargetQ4', label: 'Assigned Q4' },
  { key: 'q1Target', label: 'Q1 Target' },
  { key: 'q2Target', label: 'Q2 Target' },
  { key: 'q3Target', label: 'Q3 Target' },
  { key: 'q4Target', label: 'Q4 Target' },
]

export interface SelfRatingCurrentUser {
  id: string
  name: string
}

export function deriveCurrentUser({
  keycloakSubject,
  email,
  userName,
  firstName,
  lastName,
}: {
  keycloakSubject?: KeycloakTokenParsed['sub'] | null
  email?: string | null
  userName?: string | null
  firstName?: string | null
  lastName?: string | null
}): SelfRatingCurrentUser {
  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim()

  return {
    id: keycloakSubject ?? email ?? userName ?? 'current-user',
    name: displayName || userName || email || 'Current User',
  }
}

export function formatTargetDisplay(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatMetaDisplay(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export function getOPCRProgressBadge(opcr: OPCRReference) {
  if (opcr.finalizationDone) {
    return {
      label: 'Finalized',
      className: 'bg-green-50 text-green-700 border-green-200',
    }
  }

  if (opcr.selfRatingDone) {
    return {
      label: 'Done Rated',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    }
  }

  return {
    label: 'Approved',
    className: 'bg-green-50 text-green-700 border-green-200',
  }
}

export function groupKPIsByCategory(items: KPILineItem[] | null | undefined) {
  const groups: Record<KPICategory, KPILineItem[]> = {
    STRATEGIC: [],
    CORE: [],
    SUPPORT: [],
  }

  if (!items) return groups
  for (const item of items) {
    groups[item.category].push(item)
  }
  return groups
}

export function buildFiscalYears(opcrs: OPCRReference[]) {
  return Array.from(
    new Set(opcrs.map((opcr) => opcr.fiscalYear).filter(Boolean)),
  ).sort((a, b) => b.localeCompare(a))
}

export function buildDeliveryUnits(opcrs: OPCRReference[]) {
  return Array.from(
    opcrs
      .reduce((units, opcr) => {
        if (opcr.deliveryUnitId && opcr.deliveryUnitName) {
          units.set(opcr.deliveryUnitId, {
            id: opcr.deliveryUnitId,
            name: opcr.deliveryUnitName,
          })
        }
        return units
      }, new Map<string, { id: string; name: string }>())
      .values(),
  ).sort((a, b) => a.name.localeCompare(b.name))
}

export function filterApprovedOpcrs({
  opcrs,
  selectedFiscalYear,
  selectedDeliveryUnitId,
  officeId,
}: {
  opcrs: OPCRReference[]
  selectedFiscalYear: string
  selectedDeliveryUnitId: string
  officeId?: string
}) {
  return opcrs.filter((opcr) => {
    const matchYear =
      !selectedFiscalYear || opcr.fiscalYear === selectedFiscalYear
    const matchDu =
      !selectedDeliveryUnitId || opcr.deliveryUnitId === selectedDeliveryUnitId
    const matchOffice = !officeId || opcr.deliveryUnitId === officeId
    return matchYear && matchDu && matchOffice && opcr.status === 'APPROVED'
  })
}

export function getConfiguredMovFiles(
  movFiles: MOVFile[],
  configuredMOVName: string,
  configuredMOVIndex: number,
) {
  return movFiles.filter((file) => {
    if (file.configuredMOVName) {
      return file.configuredMOVName === configuredMOVName
    }

    if (file.configuredMOVIndex !== undefined) {
      return file.configuredMOVIndex === configuredMOVIndex
    }

    return file.name
      .toLowerCase()
      .includes(configuredMOVName.toLowerCase().split(' ')[0])
  })
}

export function getUncategorizedMovFiles(
  movFiles: MOVFile[],
  configuredMOVCount: number,
) {
  return movFiles.filter(
    (file) =>
      file.configuredMOVIndex === undefined ||
      file.configuredMOVIndex >= configuredMOVCount,
  )
}
