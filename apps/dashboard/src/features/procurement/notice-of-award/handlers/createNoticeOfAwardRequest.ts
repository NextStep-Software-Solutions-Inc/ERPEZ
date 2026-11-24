import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'
import type { CreateNoticeOfAwardPayload, AwardBacResolutionSource } from '../types'
import { mapTypeToBackend } from '../utils/mapNoticeOfAward'

export const createNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards',
  key: null,
  fetcher: async ({
    data,
  }: {
    data: CreateNoticeOfAwardPayload & { awardSource?: AwardBacResolutionSource }
  }): Promise<{ id: string }> => {
    const payload = {
      bacResolutionId: data.bacResolutionId,
      date: data.date,
      dateBid: data.dateBid,
      description: data.description,
      type: mapTypeToBackend(data.type),
    }

    const response = await api.post<APIResponse<string>>('/notice-of-awards', payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to create Notice of Award.')
    }

    return { id: response.data.data }
  },
}
