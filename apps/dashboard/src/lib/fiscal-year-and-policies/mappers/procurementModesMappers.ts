import type {
  ProcurementMode,
  ProcurementModeDisplay,
} from '../procurement-threshold.types'
import type { CreateProcurementModePayload } from '../requests/createProcurementModeRequest'
import type { UpdateProcurementModePayload } from '../requests/updateProcurementModeRequest'
import type { ModeOfProcurementFormData } from '@/components/features/planning/procurement-library/types'

function parseThresholdInput(value: string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }

  const normalized = value.trim()
  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Maps API ProcurementMode response to frontend display format
 */
export function mapProcurementModeToDisplay(
  mode: ProcurementMode,
): ProcurementModeDisplay {
  return {
    id: mode.id,
    modeName: mode.name,
    description: mode.description,
    minThreshold: mode.minThreshold,
    maxThreshold: mode.maxThreshold,
    isArchived: mode.isArchived,
    isActive: mode.isActive,
    categoryId: mode.procurementCategory.id,
    categoryName: mode.procurementCategory.name,
    createdAt: mode.createdAt,
    updatedAt: mode.updatedAt,
  }
}

/**
 * Maps frontend form data to API payload for creation
 */
export function mapFormDataToCreatePayload(
  formData: ModeOfProcurementFormData,
): CreateProcurementModePayload {
  const minThreshold = parseThresholdInput(formData.minThreshold) ?? 0
  const maxThreshold = parseThresholdInput(formData.maxThreshold)

  return {
    name: formData.name ? formData.name.trim() : null,
    description: formData.description ? formData.description.trim() : null,
    procurementCategoryId: formData.procurementCategoryId,
    minThreshold,
    maxThreshold,
  }
}

/**
 * Maps frontend form data to API payload for update
 */
export function mapFormDataToUpdatePayload(
  formData: Partial<ModeOfProcurementFormData>,
): UpdateProcurementModePayload {
  const minThreshold = parseThresholdInput(formData.minThreshold)
  const maxThreshold = parseThresholdInput(formData.maxThreshold)

  return {
    name: formData.name ? formData.name.trim() : formData.name,
    description: formData.description ? formData.description.trim() : null,
    procurementCategoryId: formData.procurementCategoryId,
    isActive: formData.isActive,
    minThreshold: minThreshold ?? undefined,
    maxThreshold: maxThreshold ?? undefined,
  }
}
