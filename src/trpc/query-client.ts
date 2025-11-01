/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        retry: (failureCount, error: any) => {
          if (error?.data?.code === "FORBIDDEN" || "UNAUTHORIZED") {
            return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: (query) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const error: any = query.state.error;
          if (error?.data?.code === "FORBIDDEN" || "UNAUTHORIZED") {
            return false;
          }
          return true;
        },
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
