import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib';
import type { GeneralRatingScale } from '../types';
import api from '@/services/api';

const endpoint = '/general-rating-scales';

export const getGeneralRatingScalesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<GeneralRatingScale>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<GeneralRatingScale>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
