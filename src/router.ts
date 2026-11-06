import { createRouter } from "@tanstack/react-router";
import { queryClient } from "./api/query-client.ts";
import { routeTree } from "./routeTree.gen.ts";

export const router = createRouter({
  routeTree,
  context: { queryClient },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
