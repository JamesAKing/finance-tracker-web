import { useCsrfToken } from "../api/csrf.ts";

export function LogoutButton() {
  const { data: csrfToken } = useCsrfToken();

  return (
    <form method="post" action="/api/auth/logout">
      <input type="hidden" name="_csrf" value={csrfToken ?? ""} />
      <button type="submit" disabled={!csrfToken}>
        Log out
      </button>
    </form>
  );
}
