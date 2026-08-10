import { api } from "~/services/api";
import {
  type PaginationResponse,
  type QueryBlueprintFromTemplate,
} from "erpez-shared-lib";
import { type Tenant } from "../type/Tenant";
const endpoint = "/tenants";

type QueryParams = {
  pageSize?: number;
  pageNumber?: number;

};
export const getTenantsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<Tenant>,
  QueryParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({
    finalUrl,
    signal,
  }): Promise<PaginationResponse<Tenant>> => {
    const response = await api.get<PaginationResponse<Tenant>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
