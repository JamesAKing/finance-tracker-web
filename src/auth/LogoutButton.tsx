import { useEffect, useState } from "react";

import { authApi } from "../api/client.ts";

// Logout is a browser form post, because the service answers it with a redirect to Keycloak.
// A form cannot set the X-CSRF-Token header, so the token goes in the _csrf field.
export function LogoutButton() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let ignore = false;

    authApi
      .getCsrfToken()
      .then(({ csrfToken }) => {
        if (!ignore) setCsrfToken(csrfToken);
      })
      .catch(() => {
        if (!ignore) setFailed(true);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <form method="post" action="/api/auth/logout">
      <input type="hidden" name="_csrf" value={csrfToken ?? ""} />
      <button type="submit" disabled={csrfToken === null}>
        Sign out
      </button>
      {failed && <p role="alert">Sign out is not available now. Refresh the page to try again.</p>}
    </form>
  );
}
