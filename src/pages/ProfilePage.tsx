import { useAuth } from "../auth/auth-context.ts";
import { LogoutButton } from "../auth/LogoutButton.tsx";

export function ProfilePage() {
  const auth = useAuth();
  if (auth.status !== "authenticated") return null;

  return (
    <main>
      <h1>Your account</h1>
      <dl>
        <dt>Email</dt>
        <dd>{auth.user.email}</dd>
      </dl>
      <LogoutButton />
    </main>
  );
}
