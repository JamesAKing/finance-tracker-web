import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { authApi } from "./api/client.ts";
import { currentUserQueryOptions } from "./auth/queries.ts";
import { HomePage } from "./pages/HomePage.tsx";

type RouterContext = {
  queryClient: QueryClient;
};

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  pendingComponent: () => <p>Loading…</p>,
  errorComponent: () => (
    <p role="alert">We could not check your session. Refresh the page to try again.</p>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  // The service sends the browser back with ?login=failed when a login did not finish.
  validateSearch: (search: Record<string, unknown>): { login?: "failed" } =>
    search.login === "failed" ? { login: "failed" } : {},
  beforeLoad: async ({ context, search }) => {
    const user = await context.queryClient.ensureQueryData(currentUserQueryOptions);

    // Nobody is signed in: send the browser to the service, which sends it to Keycloak. The
    // Keycloak page also has the register and reset password links.
    if (user === null && search.login !== "failed") {
      throw redirect({ href: "/api/auth/login", reloadDocument: true });
    }

    return { user };
  },
  loader: async ({ context }) =>
    context.user === null ? null : (await authApi.getCsrfToken()).csrfToken,
  component: HomePage,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([homeRoute]),
  context: { queryClient: undefined! },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
