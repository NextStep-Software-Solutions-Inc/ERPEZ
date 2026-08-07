import api from '@/services/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { RatingScaleTemplate } from '../types'

export function useRatingScaleTemplateQuery(id: string | null | undefined) {
  return useQuery({
    queryKey: ['rating-scale-template-review', id],
    queryFn: async () => {
      if (!id) return null
      const response = await api.get<{ data: RatingScaleTemplate }>(`/rating-scale-templates/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useUpdateRatingScaleTemplateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<RatingScaleTemplate> }) => {
      const response = await api.put<{ data: RatingScaleTemplate }>(`/rating-scale-templates/${id}`, payload)
      return response.data.data
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['rating-scale-template-review', variables.id] })
    }
  })
}
