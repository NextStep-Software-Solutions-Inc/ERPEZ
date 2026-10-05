import { api } from '~/services/api';
import {
  type QueryBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/roles/permissions';

export interface PermissionDefinition {
  key: string;
  displayName: string;
  description: string;
  category: string;
}

export interface PermissionCategory {
  category: string;
  permissions: PermissionDefinition[];
}

export const getRolePermissionsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PermissionCategory[]>,
  undefined
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }): Promise<APIResponse<PermissionCategory[]>> => {
    const response = await api.get<APIResponse<PermissionCategory[]>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
