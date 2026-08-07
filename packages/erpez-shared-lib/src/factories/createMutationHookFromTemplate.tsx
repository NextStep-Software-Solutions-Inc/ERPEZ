import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { buildEndpoint } from "../utils/endpoint-builder";
import { type ExtractPathParams, type MutationBlueprintFromTemplate } from "../types/Blueprint";

export function createMutationHookFromTemplate<
    TEndpoint extends string,
    TQueryParams = undefined,
    TPayload = unknown,
    TResponse = unknown,
>(blueprint: MutationBlueprintFromTemplate<TEndpoint, TResponse, TQueryParams, TPayload>) {
    return (): UseMutationResult<
        TResponse,
        unknown,
        TQueryParams extends undefined
        ? TPayload extends undefined
        ? { pathParams: ExtractPathParams<TEndpoint> } // Exclude both queryParams and payload
        : { pathParams: ExtractPathParams<TEndpoint>; payload: TPayload } // Include payload only
        : TPayload extends undefined
        ? { pathParams: ExtractPathParams<TEndpoint>; queryParams: TQueryParams } // Include queryParams only
        : { pathParams: ExtractPathParams<TEndpoint>; queryParams: TQueryParams; payload: TPayload }, // Include both queryParams and payload
        unknown
    > =>
        useMutation({
            mutationFn: async (args) => {
                const { pathParams } = args;
                const queryParams = "queryParams" in args ? args.queryParams : undefined;
                const payload = "payload" in args ? args.payload : undefined;
                const fullUrl = buildEndpoint(blueprint.endpoint, pathParams, queryParams);
                return blueprint.fetcher({ finalUrl: fullUrl, payload });
            },
            ...blueprint.defaultOptions,
        });
}
