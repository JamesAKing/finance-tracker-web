import { createFileRoute } from "@tanstack/react-router";
import { LogoutButton } from "../../session/LogoutButton.tsx";
import { useSession } from "../../session/use-session.ts";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
});

function Home() {
  const { user } = useSession();

  return (
    <main>
      <h1>Finance Tracker</h1>
      <p>Signed in as {user.email}</p>
      <LogoutButton />
    </main>
  );
}
