import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ApiError } from "@/shared/api/http/ApiError";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
          retry: (failureCount, error) => {
            if (
              error instanceof ApiError &&
              error.status >= 400 &&
              error.status < 500
            ) {
              return false;
            }
            return failureCount < 2;
          },
        },
      },
    }),
  );

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}