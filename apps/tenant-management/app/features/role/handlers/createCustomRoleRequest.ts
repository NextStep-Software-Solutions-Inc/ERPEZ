import { api } from '~/services/api';
import {
  type MutationBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/roles';

export interface CreateCustomRolePayload {
  name: string;
  description?: string;
  permissionKeys: string[];
  tenantId?: string;
}

export const createCustomRoleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreateCustomRolePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const { tenantId, ...body } = payload || ({} as CreateCustomRolePayload);
    const response = await api.post<APIResponse<string>>(
      finalUrl,
      body,
      tenantId ? { headers: { 'X-Tenant-Id': tenantId } } : undefined
    );
    return response.data;
  },
};
