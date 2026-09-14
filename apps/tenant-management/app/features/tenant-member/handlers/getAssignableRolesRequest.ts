import { api } from '~/services/api';
import {
  type QueryBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/roles/assignable';

export type RoleSummary = {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  isAssignableToTenant: boolean;
  tenantId?: string;
};

export const getAssignableRolesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<RoleSummary[]>,
  undefined
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }): Promise<APIResponse<RoleSummary[]>> => {
    const response = await api.get<APIResponse<RoleSummary[]>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
