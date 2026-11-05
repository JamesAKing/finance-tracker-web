import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { authenticate } from "../session/authenticate.ts";
import { SessionProvider } from "../session/SessionProvider.tsx";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => ({
    user: await authenticate({ queryClient: context.queryClient, searchStr: location.searchStr }),
  }),
  component: AuthenticatedLayout,
  errorComponent: ServiceUnavailable,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();

  return (
    <SessionProvider user={user}>
      <Outlet />
    </SessionProvider>
  );
}

function ServiceUnavailable() {
  const router = useRouter();

  return (
    <main>
      <h1>Something went wrong</h1>
      <p>We couldn't reach the service. Check your connection and try again.</p>
      <button type="button" onClick={() => void router.invalidate()}>
        Try again
      </button>
    </main>
  );
}
