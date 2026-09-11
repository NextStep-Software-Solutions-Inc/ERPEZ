import { dashboardApi } from '~/services/dashboardApi';
import {
  type PaginationResponse,
  type QueryBlueprintFromTemplate,
} from 'erpez-shared-lib';

export type DeliveryUnitItem = {
  id: string;
  name: string;
  code?: string;
  officeId?: string;
  parentId?: string;
  description?: string;
  responsibilityCenter?: string;
  address?: string;
  country?: string;
  contact?: string;
};

const endpoint = '/delivery-units';

type QueryParams = {
  pageSize?: number;
  pageNumber?: number;
  filters?: string;
  sorts?: string;
};

export const getDeliveryUnitsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<DeliveryUnitItem>,
  QueryParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }): Promise<PaginationResponse<DeliveryUnitItem>> => {
    const response = await dashboardApi.get<PaginationResponse<DeliveryUnitItem>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
