import {
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { type ErrorDetailsPropsTypes } from "./Error";

export type PaginationResponse<P> = {
  data: P[];
  succeeded: boolean;
  message: string;
  errors: ErrorDetailsPropsTypes;
  pageSize: number;
  pageNumber: number;
  totalPageNumber: number;
  loadMore: boolean;
  totalRows: number;
};

export type APIResponse<R> = {
  data: R;
  succeeded: boolean;
  message: string;
  errors: ErrorDetailsPropsTypes;
};

export type QueryParams = {
  pageNumber?: number
  pageSize?: number
  filters?: string
  sorts?: string
};

export type ExtractPathParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
  ? { [k in Param | keyof ExtractPathParams<`/${Rest}`>]: string }
  : T extends `${string}:${infer Param}`
  ? Record<Param, string>
  : {}; // <-- use empty record for static routes

export type QueryBlueprintFromTemplate<
  TEndpoint extends string,
  TResponse = unknown,
  TQueryParams = undefined,
  TQueryKey extends readonly unknown[] = ReturnType<
    ({
      pathParams,
      queryParams,
    }: {
      pathParams: ExtractPathParams<TEndpoint>;
      queryParams: TQueryParams;
    }) => readonly unknown[]
  >,
> = {
  endpoint: TEndpoint;
  headers?: HeadersInit;
  key: ({
    url,
    pathParams,
    queryParams,
  }: {
    url: string;
    pathParams: ExtractPathParams<TEndpoint> | object;
    queryParams?: TQueryParams;
  }) => TQueryKey;
  fetcher: ({ finalUrl, signal }: { finalUrl: string; signal?: AbortSignal }) => Promise<TResponse>;
  defaultOptions?: Omit<UseQueryOptions<TResponse, unknown, TResponse, TQueryKey>, "queryKey" | "queryFn">;
};

export type MutationBlueprintFromTemplate<
  TEndpoint extends string,
  TResponse = unknown,
  TQueryParams = undefined,
  TPayload = undefined
> = {
  endpoint: TEndpoint;
  fetcher: ({
    finalUrl,
    payload,
  }: {
    finalUrl: string;
    payload?: TPayload;
  }) => Promise<TResponse>;
  defaultOptions?: Omit<
    UseMutationOptions<
      TResponse,
      unknown,
      TQueryParams extends undefined
      ? TPayload extends undefined
      ? { pathParams: ExtractPathParams<TEndpoint> } // Exclude both queryParams and payload
      : { pathParams: ExtractPathParams<TEndpoint>; payload: TPayload } // Include payload only
      : TPayload extends undefined
      ? {
        pathParams: ExtractPathParams<TEndpoint>;
        queryParams: TQueryParams;
      } // Include queryParams only
      : {
        pathParams: ExtractPathParams<TEndpoint>;
        queryParams: TQueryParams;
        payload: TPayload;
      }, // Include both queryParams and payload
      unknown
    >,
    "mutationFn"
  >;
};
