import { createConfiguration } from "./configuration.ts";
import { createCsrfMiddleware, csrfQueryOptions } from "./csrf.ts";
import { AuthApi, HealthApi } from "./generated/index.ts";
import { queryClient } from "./query-client.ts";

const configuration = createConfiguration([
  createCsrfMiddleware(() => queryClient.fetchQuery(csrfQueryOptions)),
]);

export const authApi = new AuthApi(configuration);
export const healthApi = new HealthApi(configuration);
