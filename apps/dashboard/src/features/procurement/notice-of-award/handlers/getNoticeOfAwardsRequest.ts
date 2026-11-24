import api from '@/services/api'
import type { PaginationResponse } from 'erpez-shared-lib'
import type { NoticeOfAward } from '../types'
import {
  mapListDtoToNoticeOfAward,
  type BackendNoticeOfAwardListDto,
} from '../utils/mapNoticeOfAward'

export interface GetNoticeOfAwardsParams {
  pageNumber?: number
  pageSize?: number
  status?: string
  search?: string
  filters?: string
  sorts?: string
}

export const getNoticeOfAwardsRequest = {
  endpoint: '/notice-of-awards',
  key: null,
  fetcher: async (params?: GetNoticeOfAwardsParams): Promise<NoticeOfAward[]> => {
    const response = await api.get<PaginationResponse<BackendNoticeOfAwardListDto>>('/notice-of-awards', {
      params: {
        pageNumber: params?.pageNumber ?? 1,
        pageSize: params?.pageSize ?? 50,
        status: params?.status,
        search: params?.search,
        filters: params?.filters,
        sorts: params?.sorts,
      },
    })

    const items = response.data?.data ?? []
    return items.map(mapListDtoToNoticeOfAward)
  },
}
