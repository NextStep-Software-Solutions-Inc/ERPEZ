import type { ExtractPathParams, QueryBlueprintFromTemplate } from "@/types";
import { buildEndpoint } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

type HasPathParams<TEndpoint extends string> = keyof ExtractPathParams<TEndpoint> extends never
  ? false
  : true;

export type QueryHookArgs<TEndpoint extends string, TQueryParams> =
  TQueryParams extends undefined
  ? HasPathParams<TEndpoint> extends true
    ? { pathParams: ExtractPathParams<TEndpoint>; enabled?: boolean }
    : { enabled?: boolean }
  : { pathParams: ExtractPathParams<TEndpoint>; queryParams: TQueryParams; enabled?: boolean };

export function createQueryHookFromTemplate<TEndpoint extends string, TResponse = unknown, TQueryParams = undefined>(
  blueprint: QueryBlueprintFromTemplate<TEndpoint, TResponse, TQueryParams>,
): (args: QueryHookArgs<TEndpoint, TQueryParams>) => UseQueryResult<TResponse, unknown> {
  return (
    args: QueryHookArgs<TEndpoint, TQueryParams>,
  ) => {
    const queryParams = "queryParams" in args ? args.queryParams : ({} as TQueryParams);
    const pathParams = "pathParams" in args ? args.pathParams : ({} as ExtractPathParams<TEndpoint>);
    const enabled = "enabled" in args ? args.enabled : true;
    const finalUrl = buildEndpoint(blueprint.endpoint, pathParams, queryParams);
    const queryKey = blueprint.key({ url: finalUrl, pathParams, queryParams });
    return useQuery({
      queryKey,
      queryFn: ({ signal }) => blueprint.fetcher({ finalUrl, signal }),
      enabled,
      ...blueprint.defaultOptions,
    });
  };
}
