// Logout is a plain browser form post, because the service answers it with a redirect to
// Keycloak. The session cookie is HttpOnly and a form cannot set the X-CSRF-Token header,
// so the page passes in a token from GET /api/auth/csrf, and the form sends it in _csrf.
export function LogoutButton({ csrfToken }: { csrfToken: string }) {
  return (
    <form method="post" action="/api/auth/logout">
      <input type="hidden" name="_csrf" value={csrfToken} />
      <button type="submit">Sign out</button>
    </form>
  );
}
