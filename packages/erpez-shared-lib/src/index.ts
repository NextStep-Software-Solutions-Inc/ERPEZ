export * from "@tanstack/react-query";
export * from "./services/api";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "./lib/get-query-client";
import { createQueryHookFromTemplate } from "./factories/createQueryHookFromTemplate";
import { createMutationHookFromTemplate } from "./factories/createMutationHookFromTemplate";
import { buildEndpoint } from "./utils/endpoint-builder";
import * as types from "./types";
import * as utils from "./utils";
import QueryClientProvider from "./providers/QueryClientProvider";
import { APIResponse } from "./types";

export type {
  QueryBlueprintFromTemplate,
  MutationBlueprintFromTemplate,
  PaginationResponse,
  ExtractPathParams,
  QueryParams,
} from "./types/Blueprint";

export type { QueryHookArgs } from "./factories/createQueryHookFromTemplate";

export {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
  buildEndpoint,
  types,
  utils,
  APIResponse,
};
export { getQueryClient, ReactQueryDevtools };
export { QueryClientProvider as Provider };

export {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
  type VisibilityState,
  type Table as TableType
} from "@tanstack/react-table";
