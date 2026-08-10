/**
 * General Rating Scale API Handlers
 * Pattern: Master KPI aligned handlers with React Query mutations
 *
 * Provides type-safe async functions for CRUD operations on rating scales.
 * All handlers return promises that can be awaited.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createGeneralRatingScaleRequest } from '@/lib/fiscal-year-and-policies/requests/createGeneralRatingScaleRequest'
import { updateGeneralRatingScaleRequest } from '@/lib/fiscal-year-and-policies/requests/updateGeneralRatingScaleRequest'
import { deleteGeneralRatingScaleRequest } from '@/lib/fiscal-year-and-policies/requests/deleteGeneralRatingScaleRequest'
import { getGeneralRatingScalesRequest } from '@/lib/fiscal-year-and-policies/requests/getGeneralRatingScalesRequest'
import type { GeneralRatingScaleFormValues } from '../types'
import type { GeneralRatingScale } from '@/lib/fiscal-year-and-policies/types'

/**
 * Create a new rating scale
 *
 * @param fiscalYearId - The fiscal year ID
 * @param payload - Form values to create the rating scale
 * @returns Promise<GeneralRatingScale>
 */
export async function createRatingScaleHandler(
  fiscalYearId: string,
  payload: GeneralRatingScaleFormValues,
): Promise<GeneralRatingScale> {
  try {
    const apiPayload = {
      fiscalYearId,
      ratingLabel: payload.name, // Map form field to API field
      minScore: payload.minWeight,
      maxScore: payload.maxWeight,
      description: payload.description,
    }

    const response = await createGeneralRatingScaleRequest.fetcher({
      finalUrl: createGeneralRatingScaleRequest.endpoint,
      payload: apiPayload,
    })

    if (!response || !response.data) {
      throw new Error('Failed to create rating scale: Invalid response')
    }

    return response.data
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create rating scale'
    throw new Error(message)
  }
}

/**
 * Update an existing rating scale
 *
 * @param fiscalYearId - The fiscal year ID
 * @param ratingScaleId - The rating scale ID to update
 * @param payload - Form values to update the rating scale
 * @returns Promise<GeneralRatingScale>
 */
export async function updateRatingScaleHandler(
  fiscalYearId: string,
  ratingScaleId: string,
  payload: GeneralRatingScaleFormValues,
): Promise<GeneralRatingScale> {
  try {
    const apiPayload = {
      ratingLabel: payload.name, // Map form field to API field
      minScore: payload.minWeight,
      maxScore: payload.maxWeight,
      description: payload.description,
    }

    const finalUrl = updateGeneralRatingScaleRequest.endpoint
      .replace(':fiscalYearId', fiscalYearId)
      .replace(':id', ratingScaleId)

    const response = await updateGeneralRatingScaleRequest.fetcher({
      finalUrl,
      payload: apiPayload,
    })

    if (!response || !response.data) {
      throw new Error('Failed to update rating scale: Invalid response')
    }

    return response.data
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update rating scale'
    throw new Error(message)
  }
}

/**
 * Delete a rating scale
 *
 * @param fiscalYearId - The fiscal year ID
 * @param ratingScaleId - The rating scale ID to delete
 * @returns Promise<boolean>
 */
export async function deleteRatingScaleHandler(
  fiscalYearId: string,
  ratingScaleId: string,
): Promise<boolean> {
  try {
    const finalUrl = deleteGeneralRatingScaleRequest.endpoint
      .replace(':fiscalYearId', fiscalYearId)
      .replace(':id', ratingScaleId)

    const response = await deleteGeneralRatingScaleRequest.fetcher({
      finalUrl,
    })

    if (response?.data === undefined) {
      throw new Error('Failed to delete rating scale: Invalid response')
    }

    return true
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete rating scale'
    throw new Error(message)
  }
}

/**
 * Get all rating scales for a fiscal year with usage metadata
 * (Note: Usage tracking requires enhancement to the API)
 *
 * @param fiscalYearId - The fiscal year ID
 * @returns Promise<Array<GeneralRatingScale>>
 */
export async function getRatingScalesHandler(
  fiscalYearId: string,
): Promise<GeneralRatingScale[]> {
  try {
    const finalUrl = getGeneralRatingScalesRequest.endpoint.replace(
      ':fiscalYearId',
      fiscalYearId,
    )

    const response = await getGeneralRatingScalesRequest.fetcher({
      finalUrl,
      signal: new AbortController().signal,
    })

    return response?.data || []
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch rating scales'
    throw new Error(message)
  }
}

/**
 * Mock data for usage information
 * TODO: Replace with real API call once usage tracking endpoint is available
 */
const mockUsageData: Record<string, { usageCount: number; usedBy: string[] }> =
  {
    // Example structure:
    // 'scale-id-1': { usageCount: 5, usedBy: ['indicator-1', 'indicator-2', ...] }
  }

/**
 * Get usage information for a rating scale
 * Currently mocked; will be integrated with real API
 *
 * @param scaleId - The rating scale ID
 * @returns Usage count and list of indicator IDs using this scale
 */
export function getRatingScaleUsage(scaleId: string): {
  usageCount: number
  usedBy: string[]
} {
  return mockUsageData[scaleId] || { usageCount: 0, usedBy: [] }
}

/**
 * Hook: useCreateRatingScale
 * React Query mutation for creating a rating scale
 */
export function useCreateRatingScale(fiscalYearId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: GeneralRatingScaleFormValues) =>
      createRatingScaleHandler(fiscalYearId, payload),
    onSuccess: () => {
      // Invalidate queries to refetch rating scales
      queryClient.invalidateQueries({
        queryKey: [getGeneralRatingScalesRequest.endpoint, fiscalYearId],
      })
    },
  })
}

/**
 * Hook: useUpdateRatingScale
 * React Query mutation for updating a rating scale
 */
export function useUpdateRatingScale(fiscalYearId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ratingScaleId,
      payload,
    }: {
      ratingScaleId: string
      payload: GeneralRatingScaleFormValues
    }) => updateRatingScaleHandler(fiscalYearId, ratingScaleId, payload),
    onSuccess: () => {
      // Invalidate queries to refetch rating scales
      queryClient.invalidateQueries({
        queryKey: [getGeneralRatingScalesRequest.endpoint, fiscalYearId],
      })
    },
  })
}

/**
 * Hook: useDeleteRatingScale
 * React Query mutation for deleting a rating scale
 */
export function useDeleteRatingScale(fiscalYearId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ratingScaleId: string) =>
      deleteRatingScaleHandler(fiscalYearId, ratingScaleId),
    onSuccess: () => {
      // Invalidate queries to refetch rating scales
      queryClient.invalidateQueries({
        queryKey: [getGeneralRatingScalesRequest.endpoint, fiscalYearId],
      })
    },
  })
}
