import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'
import type { AwardBacResolutionSource } from '../types'
import {
  mapAvailableResolutionToSource,
  type BackendAvailableResolutionDto,
} from '../utils/mapNoticeOfAward'

export const getAvailableAwardBacResolutionsRequest = {
  endpoint: '/notice-of-awards/available-resolutions',
  key: null,
  fetcher: async (): Promise<AwardBacResolutionSource[]> => {
    const response = await api.get<APIResponse<BackendAvailableResolutionDto[]>>('/notice-of-awards/available-resolutions')
    const list = response.data?.data ?? []
    return list.map(mapAvailableResolutionToSource)
  },
}
