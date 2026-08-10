import type { QueryClient } from "erpez-shared-lib";

/**
 * Invalidate queries whose queryKey string prefix matches the provided key.
 * Keeps the predicate logic centralized and easier to test.
 */
export const invalidateQueries = (queryClient: QueryClient, key: string) => {
  void queryClient.invalidateQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === "string" &&
      (query.queryKey[0] as string).startsWith(key),
  });
};

export default invalidateQueries;
