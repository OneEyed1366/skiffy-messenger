//#region Imports
import { QueryClient } from "@tanstack/react-query";
//#endregion

//#region Types
type IQueryClientConfig = {
  staleTime: number;
  gcTime: number;
  queryRetry: number;
  mutationRetry: number;
  refetchOnWindowFocus: boolean;
};
//#endregion

//#region Config
export const queryClientConfig: IQueryClientConfig = {
  staleTime: 1000 * 60, // 1 minute
  gcTime: 1000 * 60 * 5, // 5 minutes
  queryRetry: 2,
  mutationRetry: 1,
  refetchOnWindowFocus: true,
} as const satisfies IQueryClientConfig;
//#endregion

//#region QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: queryClientConfig.staleTime,
      gcTime: queryClientConfig.gcTime,
      retry: queryClientConfig.queryRetry,
      refetchOnWindowFocus: queryClientConfig.refetchOnWindowFocus,
    },
    mutations: {
      retry: queryClientConfig.mutationRetry,
    },
  },
});
//#endregion
