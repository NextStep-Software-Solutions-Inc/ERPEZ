import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'
import type { NoticeOfAward } from '../types'
import {
  mapDetailDtoToNoticeOfAward,
  type BackendNoticeOfAwardDetailDto,
} from '../utils/mapNoticeOfAward'

export const getNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards/:id',
  key: null,
  fetcher: async ({ noaId }: { noaId: string }): Promise<NoticeOfAward> => {
    const response = await api.get<APIResponse<BackendNoticeOfAwardDetailDto>>(`/notice-of-awards/${noaId}`)
    if (!response.data?.data) {
      throw new Error(response.data?.message || 'Notice of Award not found.')
    }

    return mapDetailDtoToNoticeOfAward(response.data.data)
  },
}
