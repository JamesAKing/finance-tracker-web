import { getRouteApi } from "@tanstack/react-router";

import { LogoutButton } from "../auth/LogoutButton.tsx";

const route = getRouteApi("/");

export function HomePage() {
  const { user } = route.useRouteContext();
  const csrfToken = route.useLoaderData();

  // The route only gets here without a user after a failed login. Do not send the browser
  // back to Keycloak by itself, or a login that keeps failing would loop.
  if (user === null) {
    return (
      <main>
        <h1>Finance Tracker</h1>
        <p role="alert">We could not sign you in.</p>
        <a href="/api/auth/login">Try again</a>
      </main>
    );
  }

  return (
    <main>
      <h1>Your account</h1>
      <dl>
        <dt>Email</dt>
        <dd>{user.email}</dd>
      </dl>
      {csrfToken !== null && <LogoutButton csrfToken={csrfToken} />}
    </main>
  );
}
