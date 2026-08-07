import type { PreProcurementConferenceValue, ProjectType } from '../types'

export const QUANTITY_AND_SIZE_LABEL =
  'Quantity and Size of the Project to be Procured'

export const PPMP_FIELD_LABELS = {
  projectType: 'Project Type',
  quantityAndSize: QUANTITY_AND_SIZE_LABEL,
  preProcurementConference: 'Pre-Procurement Conference',
  procurementStart: 'Procurement Start',
  procurementEnd: 'Procurement End',
  procurementPeriod: 'Procurement Period',
  marketScopingForm: 'Market Scoping Form',
  marketScopingReference: 'MSF Reference',
} as const

export const PROJECT_TYPE_OPTIONS: ReadonlyArray<{
  value: ProjectType
  label: string
}> = [
  { value: 'Goods', label: 'Goods' },
  { value: 'Infra', label: 'Infrastructure' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'N/A', label: 'N/A' },
]

export const PRE_PROCUREMENT_CONFERENCE_OPTIONS: ReadonlyArray<{
  value: PreProcurementConferenceValue
  label: string
}> = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'N/A', label: 'N/A' },
]

export const PPMP_METADATA_DEFAULTS = {
  projectType: null as ProjectType | null,
  sizeSpecification: '',
  preProcurementConference: null as PreProcurementConferenceValue | null,
  procurementStart: null as string | null,
  procurementEnd: null as string | null,
  marketScopingId: null as string | null,
  marketScopingRef: null as string | null,
} as const

export function displayNaValue(value: string | null | undefined): string {
  if (value == null || value.trim() === '') {
    return 'N/A'
  }

  return value
}

export function displayPreProcurementConference(
  value: PreProcurementConferenceValue | boolean | null | undefined,
): string {
  if (value === true || value === 'yes') {
    return 'Yes'
  }

  if (value === false || value === 'no') {
    return 'No'
  }

  if (value == null) {
    return 'N/A'
  }

  return 'N/A'
}

export function isNaProjectType(
  value: ProjectType | null | undefined,
): boolean {
  return value === 'N/A'
}
