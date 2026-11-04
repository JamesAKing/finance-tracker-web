import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { currentUserQueryOptions } from "./auth/queries.ts";
import { LoginPage } from "./pages/LoginPage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";

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

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search: Record<string, unknown>): { login?: "failed" } =>
    search.login === "failed" ? { login: "failed" } : {},
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(currentUserQueryOptions);
    if (user !== null) throw redirect({ to: "/" });
  },
  component: LoginPage,
});

// Every route under this one needs a signed-in user. Others get sent to /login.
const authedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authed",
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(currentUserQueryOptions);
    if (user === null) throw redirect({ to: "/login" });
    return { user };
  },
});

const profileRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: "/",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([loginRoute, authedRoute.addChildren([profileRoute])]);

export const router = createRouter({
  routeTree,
  context: { queryClient: undefined! },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
