import { api } from "~/services/api";
import {
  type APIResponse,
  type QueryBlueprintFromTemplate,
  type QueryKey,
  type QueryParams,
} from "erpez-shared-lib";
import { type TenantDetails } from "../type/Tenant";

const endpoint = "/tenants/:id";

export const getTenantRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<TenantDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<TenantDetails>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
