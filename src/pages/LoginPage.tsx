import { Navigate, useSearchParams } from "react-router";

import { useAuth } from "../auth/auth-context.ts";

export function LoginPage() {
  const auth = useAuth();
  const [searchParams] = useSearchParams();

  if (auth.status === "authenticated") return <Navigate to="/" replace />;

  return (
    <main>
      <h1>Finance Tracker</h1>
      {searchParams.get("login") === "failed" && (
        <p role="alert">We could not sign you in. Try again.</p>
      )}
      {/* A plain link, not a fetch call: the service redirects the browser to Keycloak. */}
      <a href="/api/auth/login">Sign in</a>
    </main>
  );
}
