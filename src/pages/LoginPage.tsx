import { getRouteApi } from "@tanstack/react-router";

const route = getRouteApi("/login");

export function LoginPage() {
  const { login } = route.useSearch();

  return (
    <main>
      <h1>Finance Tracker</h1>
      {login === "failed" && <p role="alert">We could not sign you in. Try again.</p>}
      {/* A plain link, not a fetch call: the service redirects the browser to Keycloak. */}
      <a href="/api/auth/login">Sign in</a>
    </main>
  );
}
