import { api } from "~/services/api";
import {
  type PaginationResponse,
  type QueryBlueprintFromTemplate,
} from "erpez-shared-lib";
import { type Module } from "../type/Module";
const endpoint = "/modules";

type QueryParams = {
  pageSize?: number;
  pageNumber?: number;
  serviceIds?: string[];
  names?: string[];
};
export const getModulesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<Module>,
  QueryParams
> = {
  endpoint,
  key: ({ queryParams, pathParams, url }) =>
    ["get-modules", url, endpoint, pathParams, queryParams] as const,
  fetcher: async ({
    finalUrl,
    signal,
  }): Promise<PaginationResponse<Module>> => {
    const response = await api.get<PaginationResponse<Module>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
