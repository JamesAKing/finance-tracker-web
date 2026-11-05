import { queryOptions, useQuery } from "@tanstack/react-query";

import { createConfiguration } from "./configuration.ts";
import { AuthApi, type Middleware } from "./generated/index.ts";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

const csrfApi = new AuthApi(createConfiguration());

export const csrfQueryOptions = queryOptions({
  queryKey: ["auth", "csrf"],
  queryFn: async () => (await csrfApi.getCsrfToken()).csrfToken,
  staleTime: Infinity,
});

export function useCsrfToken() {
  return useQuery(csrfQueryOptions);
}

export function createCsrfMiddleware(getToken: () => Promise<string>): Middleware {
  return {
    async pre({ url, init }) {
      const method = (init.method ?? "GET").toUpperCase();
      if (SAFE_METHODS.includes(method)) return;

      const headers = new Headers(init.headers);
      headers.set("X-CSRF-Token", await getToken());

      return { url, init: { ...init, headers } };
    },
  };
}
