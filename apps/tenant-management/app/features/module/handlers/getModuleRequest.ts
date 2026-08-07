import { api } from "~/services/api";
import {
  type APIResponse,
  type QueryBlueprintFromTemplate,
} from "erpez-shared-lib";
// import { type TenantDetails } from "../type/Tenant";
import { type ModuleDetails } from "../type/Module";

const endpoint = "/modules/:id";

type GetModuleDetailsQueryParams = {
  id: string;
};

export const getModuleDetailsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ModuleDetails>,
  GetModuleDetailsQueryParams
> = {
  endpoint,
  key: ({ url, pathParams, queryParams }) =>
    ["get-module-details", url, endpoint, pathParams, queryParams] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ModuleDetails>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
