import { useQuery } from "@tanstack/react-query";

import { csrfTokenQueryOptions } from "./queries.ts";

// Logout is a browser form post, because the service answers it with a redirect to Keycloak.
// A form cannot set the X-CSRF-Token header, so the token goes in the _csrf field.
export function LogoutButton() {
  const { data: csrfToken, isError } = useQuery(csrfTokenQueryOptions);

  return (
    <form method="post" action="/api/auth/logout">
      <input type="hidden" name="_csrf" value={csrfToken ?? ""} />
      <button type="submit" disabled={csrfToken === undefined}>
        Sign out
      </button>
      {isError && <p role="alert">Sign out is not available now. Refresh the page to try again.</p>}
    </form>
  );
}
