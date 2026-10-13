import { api } from '~/services/api';
import {
  type QueryBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/tenant-members/assignable-roles';

export type RoleSummary = {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  isAssignableToTenant: boolean;
  tenantId?: string;
  permissionKeys?: string[];
  permissionDisplayNames?: string[];
};

export const getAssignableRolesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<RoleSummary[]>,
  undefined
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }): Promise<APIResponse<RoleSummary[]>> => {
    const effectiveTenantId =
      typeof window !== 'undefined' ? localStorage.getItem('erpez_tenant_id') : null;

    if (!effectiveTenantId) {
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'No tenant context selected.',
        data: [],
      } as unknown as APIResponse<RoleSummary[]>;
    }

    const response = await api.get<APIResponse<RoleSummary[]>>(finalUrl, {
      signal,
      headers: {
        'X-Tenant-Id': effectiveTenantId,
      },
    });
    return response.data;
  },
};
