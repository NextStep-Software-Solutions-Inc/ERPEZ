import { api } from '~/services/api';
import {
  type PaginationResponse,
  type QueryBlueprintFromTemplate,
} from 'erpez-shared-lib';
import { type TenantMember } from '../types/TenantMember';

const endpoint = '/tenant-members';

type QueryParams = {
  pageSize?: number;
  pageNumber?: number;
  tenantId?: string;
  filters?: string;
  sorts?: string;
};

export const getTenantMembersRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<TenantMember>,
  QueryParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }): Promise<PaginationResponse<TenantMember>> => {
    const response = await api.get<PaginationResponse<TenantMember>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
