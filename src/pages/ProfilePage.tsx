import { getRouteApi } from "@tanstack/react-router";

import { LogoutButton } from "../auth/LogoutButton.tsx";

const route = getRouteApi("/_authed/");

export function ProfilePage() {
  const { user } = route.useRouteContext();

  return (
    <main>
      <h1>Your account</h1>
      <dl>
        <dt>Email</dt>
        <dd>{user.email}</dd>
      </dl>
      <LogoutButton />
    </main>
  );
}
