import { api } from '~/services/api';
import {
  type MutationBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/roles/:id';

export interface DeleteCustomRolePayload {
  tenantId?: string;
}

export const deleteCustomRoleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  undefined,
  DeleteCustomRolePayload | undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.delete<APIResponse<boolean>>(
      finalUrl,
      payload?.tenantId ? { headers: { 'X-Tenant-Id': payload.tenantId } } : undefined
    );
    return response.data;
  },
};
