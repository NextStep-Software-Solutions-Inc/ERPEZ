/**
 * Market Scoping Form Transformation Utilities
 * Converts form data (mm/yyyy format) to API payload (ISO 8601 dates)
 * Automatically uploads any binary file attachments to /files/upload before payload submission.
 */

import type { MarketScopingForm } from '../types/marketScopingTypes'
import type { CreateMarketScopingRequest } from '../types/marketScopingApiTypes'
import api from '@/services/api'

/**
 * Convert mm/yyyy format to ISO 8601 date string
 * mm/yyyy format becomes the first day of that month at 00:00:00 UTC
 */
function convertMonthYearToISO(monthYear?: string): string {
  if (!monthYear || typeof monthYear !== 'string' || !monthYear.includes('/')) {
    return new Date().toISOString()
  }
  const [month, year] = monthYear.split('/')
  const m = parseInt(month, 10)
  const y = parseInt(year, 10)
  if (isNaN(m) || isNaN(y)) {
    return new Date().toISOString()
  }
  const date = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0))
  return date.toISOString()
}

/**
 * GUID regex pattern for payload validation
 */
const GUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

/**
 * Upload raw binary file attachment via /files/upload to obtain real storage fileId
 */
async function uploadAttachmentFile(file: {
  rawFile?: File
  fileUrl: string
  fileName: string
}): Promise<string> {
  if (file.rawFile) {
    try {
      const formData = new FormData()
      formData.append('file', file.rawFile)
      const res = await api.post<{ succeeded: boolean; data: string }>(
        '/files/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      if (res.data?.data) {
        return res.data.data
      }
    } catch (err) {
      console.error('Failed to upload attachment file:', file.fileName, err)
    }
  }
  return file.fileUrl
}

/**
 * Transform form data to API request payload
 * Maps the frontend form structure to the backend API contract
 * Uploads all raw file attachments to file storage prior to creation
 *
 * @param formData - The form data collected from the wizard
 * @param fallbackUserId - The current user's ID from Keycloak
 * @returns The payload ready for the API endpoint
 */
export async function transformFormToApiPayload(
  formData: MarketScopingForm,
  fallbackUserId: string,
): Promise<CreateMarketScopingRequest> {
  const targetLibActivityId =
    formData.targetLineItemBudgetActivityId || formData.linkedLibActivityId
  const isLinkedLibActivityValidGuid =
    targetLibActivityId &&
    GUID_REGEX.test(targetLibActivityId) &&
    !targetLibActivityId.startsWith('11111111') &&
    !targetLibActivityId.startsWith('22222222')

  const isTargetLibValidGuid =
    formData.targetLineItemBudgetId &&
    GUID_REGEX.test(formData.targetLineItemBudgetId) &&
    !formData.targetLineItemBudgetId.startsWith('11111111') &&
    !formData.targetLineItemBudgetId.startsWith('22222222')

  const activitiesConducted = await Promise.all(
    (formData.activities || [])
      .filter((activity) => activity.checked)
      .map(async (activity) => {
        const attachments = await Promise.all(
          (activity.attachments || []).map(async (file) => ({
            fileUrl: await uploadAttachmentFile(file),
            fileName: file.fileName,
          })),
        )
        const settingsId = activity.activitySettingsId || activity.id
        return {
          activitySettingsId: settingsId,
          activityId: settingsId,
          attachments,
        }
      }),
  )

  const parameterEvaluations = await Promise.all(
    (formData.parameters || []).map(async (param) => {
      const attachments = await Promise.all(
        (param.attachments || []).map(async (file) => ({
          fileUrl: await uploadAttachmentFile(file),
          fileName: file.fileName,
        })),
      )
      return {
        parameterSettingsId: param.parameterId,
        parameterId: param.parameterId,
        isConsidered: param.considered === 'Yes',
        remarks: param.recommendations,
        attachments,
      }
    }),
  )

  return {
    userId: formData.userId || fallbackUserId,
    projectName: formData.projectName,
    estimatedBudget: formData.estimatedBudget,
    periodFrom: convertMonthYearToISO(formData.periodFrom),
    periodTo: convertMonthYearToISO(formData.periodTo),
    deliveryDate: convertMonthYearToISO(formData.expectedDeliveryDate),
    ...(isLinkedLibActivityValidGuid
      ? { targetLineItemBudgetActivityId: targetLibActivityId }
      : isTargetLibValidGuid
        ? { targetLineItemBudgetId: formData.targetLineItemBudgetId }
        : {}),
    activitiesConducted,
    parameterEvaluations,
  }
}
