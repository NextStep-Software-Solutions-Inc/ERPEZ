import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOpcrItemRatings,
  createOrUpdateRating,
  putOpcrItemRatingPmtReview,
  type CreateOrUpdateRatingPayload,
} from '@/services/api/ratings'

export function useGetOpcrItemRatings(itemId: string | null | undefined) {
  return useQuery({
    queryKey: ['opcr-item-ratings', itemId],
    queryFn: async () => {
      if (!itemId) return []
      return getOpcrItemRatings(itemId)
    },
    enabled: !!itemId,
  })
}

/**
 * POST /opcrs/items/:id/ratings
 * Creates a new rating record (selfRating or pmtRating).
 * NOTE: The backend must support upsert (or PATCH) for pmtRating updates.
 * Currently only works for initial self-rating creation.
 */
export function useCreateOrUpdateRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string
      payload: CreateOrUpdateRatingPayload
    }) => {
      return createOrUpdateRating(itemId, payload)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['opcr-item-ratings', variables.itemId],
      })
    },
  })
}

// Aliases
export { useCreateOrUpdateRating as useCreateRating }

/**
 * Stub for future PATCH /opcrs/items/:itemId/ratings/:ratingId support.
 * Currently the backend does not expose this endpoint.
 */
export function useUpdateRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      itemId,
      ratingId,
      payload,
    }: {
      itemId: string
      ratingId: string
      payload: Partial<CreateOrUpdateRatingPayload>
    }) => {
      return putOpcrItemRatingPmtReview(ratingId, {
        pmtRating: payload.pmtRating,
        pmtRemark: payload.pmtRemark,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['opcr-item-ratings', variables.itemId],
      })
    },
  })
}
