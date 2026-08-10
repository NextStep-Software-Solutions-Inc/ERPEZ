import { toast } from 'sonner'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { createLineItemBudgetDetailsRequest } from './createLineItemBudgetDetailsRequest'
import {
  WFPLineItem,
  CreateWFPLineItemPayload,
  BatchSubmissionResult,
  LineItemSubmissionResult,
  MutateAsyncParams,
} from '../types/wfp-line-item'

const useCreateLineItemBudgetDetails = createMutationHookFromTemplate(
  createLineItemBudgetDetailsRequest,
)

/**
 * Generates the API payload from a WFP line item
 */
export const generateWFPLineItemPayload = (
  lineItem: WFPLineItem,
  libId: string,
  libActivityId: string,
): CreateWFPLineItemPayload => ({
  lineItemBudgetId: libId,
  lineItemBudgetActivityId: libActivityId,
  wfpObjectiveActivityExpenditureId: lineItem.wfpObjectiveActivityExpenditureId,
  objectId: lineItem.objectId,
  description: lineItem.description,
  unitQuantity: lineItem.unitQuantity,
  unitCost: lineItem.unitCost,
})

/**
 * Submits multiple WFP line items concurrently
 * Returns detailed success/failure results per item
 */
export const submitWFPLineItemBatch = async <T extends Record<string, unknown>>(
  lineItems: WFPLineItem[],
  libId: string,
  libActivityId: string,
  mutateAsync: (params: MutateAsyncParams<T>) => Promise<unknown>,
): Promise<BatchSubmissionResult> => {
  const results: LineItemSubmissionResult[] = []

  // Submit all items concurrently
  const promises = lineItems.map(async (item) => {
    try {
      const payload = generateWFPLineItemPayload(
        item,
        libId,
        libActivityId,
      ) as unknown as T
      await mutateAsync({
        pathParams: {},
        payload,
      })

      results.push({
        item,
        success: true,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      results.push({
        item,
        success: false,
        error: errorMessage,
      })
    }
  })

  await Promise.allSettled(promises)

  const succeeded = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  return {
    succeeded,
    failed,
    successCount: succeeded.length,
    failureCount: failed.length,
  }
}

/**
 * Generates user-friendly submission summary message
 */
export const generateWFPSubmissionSummary = (result: BatchSubmissionResult) => {
  if (result.failureCount === 0) {
    return `Successfully created ${result.successCount} line item${result.successCount !== 1 ? 's' : ''}`
  }

  if (result.successCount === 0) {
    return `Failed to create line items. Please try again.`
  }

  return `Created ${result.successCount} of ${result.successCount + result.failureCount} line items`
}

/**
 * Hook for managing batch WFP line item submissions
 */
export const useWFPLineItemBatchSubmission = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateLineItemBudgetDetails()

  const submit = async (
    lineItems: WFPLineItem[],
    libId: string,
    libActivityId: string,
  ): Promise<BatchSubmissionResult> => {
    if (lineItems.length === 0) {
      toast.error('No line items to submit')
      throw new Error('No line items to submit')
    }

    try {
      const result = await submitWFPLineItemBatch(
        lineItems,
        libId,
        libActivityId,
        mutateAsync,
      )

      // Invalidate related queries to refresh data
      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].includes('/lib-activities'),
      })

      return result
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit line items'
      toast.error(message)
      throw error
    }
  }

  return {
    submit,
    isPending,
  }
}
